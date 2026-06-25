from rest_framework import generics, permissions, viewsets

from .models import Client
from .serializers import TenantRegistrationSerializer, TenantSerializer


class TenantRegistrationView(generics.CreateAPIView):
    """
    Public endpoint for onboarding a new wholesaler tenant.

    POST /api/tenants/register/ creates the tenant schema, the primary domain,
    and the first ADMIN user.
    """

    serializer_class = TenantRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class TenantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-only read endpoint for tenants.

    This is useful while debugging tenant creation. It is read-only to avoid
    accidentally changing tenant schema/domain records through a generic API.
    """

    queryset = Client.objects.all().order_by("id")
    serializer_class = TenantSerializer
    permission_classes = [permissions.IsAdminUser]
