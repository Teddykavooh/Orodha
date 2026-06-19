from django.contrib import admin
from django_tenants.admin import TenantAdminMixin

from .models import Client

# Register your models here.
@admin.register(Client)
class ClientAdmin(TenantAdminMixin, admin.ModelAdmin):
    list_display = ('schema_name', 'business_name', 'paid_until', 'on_trial', 'created_on')