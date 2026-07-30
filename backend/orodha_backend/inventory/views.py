from django.db.models import Q
from django.db import connection, transaction

from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import BookItem, Hub, InventoryMovement, Product
from .permissions import AdminOrReadOnly, CanDeleteInventory
from .serializers import (
    BookItemSerializer,
    HubSerializer,
    InventoryMovementSerializer,
    ProductSerializer,
)


class HubViewSet(viewsets.ModelViewSet):
    """CRUD endpoint for tenant hubs."""

    queryset = Hub.objects.all().order_by("id")
    serializer_class = HubSerializer
    permission_classes = [permissions.IsAuthenticated, AdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if getattr(user, "role", None) == "ADMIN":
            return queryset
        if getattr(user, "hub_id", None):
            return queryset.filter(id=user.hub_id)
        return queryset.none()


class ProductViewSet(viewsets.ModelViewSet):
    """CRUD endpoint for tenant product catalog records."""

    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, AdminOrReadOnly]


class BookItemViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for physical book copies.

    select_related() avoids extra database queries when returning the linked
    product and current hub for each copy.
    """

    queryset = BookItem.objects.select_related("product", "current_hub").order_by("id")
    serializer_class = BookItemSerializer
    permission_classes = [permissions.IsAuthenticated, CanDeleteInventory]

    def get_queryset(self):
        queryset = BookItem.objects.select_related("product", "current_hub").order_by("id")
        user = self.request.user
        if getattr(user, "role", None) == "ADMIN":
            return queryset
        if getattr(user, "hub_id", None):
            return queryset.filter(current_hub_id=user.hub_id)
        return queryset.none()
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Custom Create action to support batch increments and avoid 
        duplicate records for the exact same product at a specific location.
        """  
        product_id = request.data.get('product')
        hub_id = request.data.get('current_hub')
        add_qty = int(request.data.get('quantity', 1))

        print("New create func running .... ", product_id)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Selected product does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        
        book_item = BookItem.objects.filter(product=product, current_hub_id=hub_id).first()

        # Find matching stock row or instantiate a fresh one
        # book_item, created = BookItem.objects.get_or_create(
        #     product=product,
        #     current_hub=hub_id,
        #     defaults={
        #         'serial_number': product.isbn,
        #         'quantity': 0
        #     }
        # )

        if not book_item:
            book_item = BookItem.objects.create(
                product=product,
                current_hub_id=hub_id,
                serial_number=product.isbn, # Preserves front-end lookup columns
                quantity=0
            )

        # Increment batch values safely
        book_item.quantity += add_qty
        book_item.save()

         # Audit Log: Create a tracking record in your movement ledger
        InventoryMovement.objects.create(
            book_item=book_item,
            quantity=add_qty,
            action="INGEST",
            from_hub=None,
            to_hub_id=hub_id,
            performed_by=getattr(request.user, "userprofile", None) # Safe fallback if profiles exist
        )

        # Return the standard Serialised response to keep Redux updates smooth
        serializer = self.get_serializer(book_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['POST'], url_path='allocate')
    @transaction.atomic
    def allocate_stock(sel,request):
        """
        POST /api/book-item/allocate/
        Moves a batch of books from a source location (or warehouse) to a destination hub.
        """
        product_id = request.data.get('product')
        from_hub_id = request.data.get('from_hub') or None # None implies Main Warehouse
        to_hub_id = request.data.get('to_hub') or None
        transfer_qty = int(request.data.get('quantity', 1))
        user = request.user

        # Prevent moving stock to the exact same place
        if from_hub_id == to_hub_id:
            return Response(
                {"error": "Source and Destination locations cannot be identical."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # LOCK & ISOLATE THE SOURCE STOCK BUNDLE
        try:
            source_stock = BookItem.objects.select_for_update().get(
                product_id=product_id,
                current_hub_id=from_hub_id
            )
        except BookItem.DoesNotExist:
            return Response(
                {"error": "No available stock found for this product at the specified source location."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Volume verification
        if source_stock.quantity < transfer_qty:
            return Response(
                {"error": f"Insufficient stock for allocation. Only {source_stock.quantity} copies remain at the source."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Deduct from source pool
        source_stock.quantity -= transfer_qty
        if source_stock.quantity == 0:
            source_stock.delete()
        else:
            source_stock.save()

        # UPSERT Destination pool
        # Using .filter().first() to avoid MultipleObjectsReturned if legacy duplicate rows exist
        dest_stock = BookItem.objects.filter(product_id=product_id, current_hub_id=to_hub_id).first()
        if not dest_stock:
            dest_stock = BookItem.objects.create(
                product_id=product_id,
                current_hub_id=to_hub_id,
                serial_number=source_stock.serial_number,  # Match ISBN string fallback
                quantity=transfer_qty
            )
        else:
            # Increment existing receiving hub stock safely
            dest_stock.quantity += transfer_qty
            dest_stock.save()

        # LOG THE PERMANENT AUDIT MOVEMENT LEDGER ENTRY
        InventoryMovement.objects.create(
            book_item=dest_stock,
            quantity=transfer_qty,
            action="TRANSFER",
            from_hub_id=from_hub_id,
            to_hub_id=to_hub_id,
            performed_by=getattr(user, "userprofile", None)
        )

        return Response(
            {"message": f"Successfully allocated {transfer_qty} copies to the destination location."},
            status=status.HTTP_200_OK
        )

    '''Temp endpoint debug'''
    def list(self, request, *args, **kwargs):
        print("========== BOOKITEM ENDPOINT ==========")
        print("SCHEMA:", connection.schema_name)
        print("USER:", request.user)
        print("AUTH:", request.auth)
        print("IS AUTHENTICATED:", request.user.is_authenticated)
        print("ROLE:", getattr(request.user, "role", None))
        print("HUB:", request.user.hub_id)
        print("===================================")
        return super().list(request, *args, **kwargs)


class InventoryMovementViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for inventory movement history.

    This endpoint records how a BookItem moves between hubs or leaves inventory.
    Later, you may want to restrict updates/deletes so movement history becomes
    append-only.
    """

    queryset = InventoryMovement.objects.select_related(
        "book_item",
        "from_hub",
        "to_hub",
        "performed_by",
    ).order_by("id")
    serializer_class = InventoryMovementSerializer
    permission_classes = [permissions.IsAuthenticated, CanDeleteInventory]

    def get_queryset(self):
        queryset = InventoryMovement.objects.select_related(
            "book_item",
            "from_hub",
            "to_hub",
            "performed_by",
        ).order_by("id")
        user = self.request.user
        if getattr(user, "role", None) == "ADMIN":
            return queryset
        if getattr(user, "hub_id", None):
            return queryset.filter(
                Q(from_hub_id=user.hub_id) | Q(to_hub_id=user.hub_id)
            )
        return queryset.none()
