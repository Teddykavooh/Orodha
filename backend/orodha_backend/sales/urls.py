from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SaleLogViewSet

router = DefaultRouter()
router.register("sales", SaleLogViewSet, basename="sales")

urlpatterns = [
    path("", include(router.urls)),
]
