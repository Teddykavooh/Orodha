from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TenantRegistrationView, TenantViewSet

router = DefaultRouter()
router.register("tenants", TenantViewSet, basename="tenants")

urlpatterns = [
    path("tenants/register/", TenantRegistrationView.as_view(), name="tenant-register"),
    path("", include(router.urls)),
]
