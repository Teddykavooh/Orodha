from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SaleLogViewSet, ReportingDashboardView

router = DefaultRouter()
router.register("sales", SaleLogViewSet, basename="sales")

urlpatterns = [
    # Route your APIView using standard path syntax
    path("sales/reporting/", ReportingDashboardView.as_view(), name="sales-reporting"),
    
    # 2. Include all automated ViewSet CRUD router endpoints
    path("", include(router.urls)),
]
