from django.db.models import Q
from django.db import connection, transaction

from rest_framework import permissions, viewsets, status
from rest_framework.response import Response

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
