from django.db import models

from django_tenants.models import TenantMixin, DomainMixin

# Create your models here.
class Client(TenantMixin):
    # name = models.CharField(
    #     max_length=255,
    #     unique=True
    # )

    business_name = models.CharField(
        max_length=255
    )

     # Option A: Local File Uploads
    logo_file = models.ImageField(
        upload_to="tenant_logos/",
        blank=True,
        null=True
    )

    # Option B: External Image Links (Added)
    logo_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True
    )

    tagline = models.CharField(
        max_length=255,
        blank=True
    )

    primary_color = models.CharField(
        max_length=7,
        default='#2563EB'
    )

    secondary_color = models.CharField(
        max_length=7,
        default='#1E293B'
    )

    accent_color = models.CharField(
        max_length=7,
        default='#F97316'
    )

    paid_until = models.DateField(
        null=True,
        blank=True
    )

    on_trial = models.BooleanField(
        default=True
    )

    created_on = models.DateField(
        auto_now=True
    )

    # default true, schema will be automatically created and synced when it is saved
    auto_create_schema = True


class Domain(DomainMixin):
    pass
