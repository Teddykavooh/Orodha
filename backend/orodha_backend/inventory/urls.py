from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookItemViewSet, HubViewSet, InventoryMovementViewSet, ProductViewSet

router = DefaultRouter()
router.register("hubs", HubViewSet, basename="hubs")
router.register("products", ProductViewSet, basename="products")
router.register("book-items", BookItemViewSet, basename="book-items")
router.register("inventory-movements", InventoryMovementViewSet, basename="inventory-movements")

urlpatterns = [
    path("", include(router.urls)),
]
