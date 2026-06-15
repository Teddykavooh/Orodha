from django.db.models import Q
from rest_framework import permissions, viewsets

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
        if getattr(user, "role", None) == "WHOLESALER_ADMIN":
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
        if getattr(user, "role", None) == "WHOLESALER_ADMIN":
            return queryset
        if getattr(user, "hub_id", None):
            return queryset.filter(current_hub_id=user.hub_id)
        return queryset.none()


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
        if getattr(user, "role", None) == "WHOLESALER_ADMIN":
            return queryset
        if getattr(user, "hub_id", None):
            return queryset.filter(
                Q(from_hub_id=user.hub_id) | Q(to_hub_id=user.hub_id)
            )
        return queryset.none()
