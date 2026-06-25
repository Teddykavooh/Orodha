from rest_framework import permissions, viewsets

from django.db import connection

from .models import SaleLog
from .permissions import SaleLogPermission
from .serializers import SaleLogSerializer


class SaleLogViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoint for tenant sale records.

    select_related() keeps list/detail responses efficient by fetching the
    linked BookItem and salesperson in the same query.
    """

    queryset = SaleLog.objects.select_related("book_item", "salesperson").order_by("id")
    serializer_class = SaleLogSerializer
    # permission_classes = [permissions.IsAuthenticated, SaleLogPermission]
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = SaleLog.objects.select_related("book_item", "salesperson").order_by("id")
        user = self.request.user
        role = getattr(user, "role", None)

        if role == "WHOLESALER_ADMIN":
            return queryset
        if role == "SALES_MANAGER" and getattr(user, "hub_id", None):
            return queryset.filter(salesperson__hub_id=user.hub_id)
        if role == "SALESPERSON":
            return queryset.filter(salesperson=user)
        return queryset.none()
    
    def perform_create(self, serializer):
        # 1. Save the sale log record natively
        sale_log = serializer.save(salesperson=self.request.user)
        
        # 2. Automatically grab the linked physical book item
        book_item = sale_log.book_item
        
        # 3. Mutate the database status to SOLD and save
        book_item.status = "SOLD"
        book_item.save()

    '''Temp endpoint debug'''
    def list(self, request, *args, **kwargs):
        print("========== SALES ENDPOINT ==========")
        print("SCHEMA:", connection.schema_name)
        print("USER:", request.user)
        print("AUTH:", request.auth)
        print("IS AUTHENTICATED:", request.user.is_authenticated)
        print("ROLE:", getattr(request.user, "role", None))
        print("===================================")
        return super().list(request, *args, **kwargs)
