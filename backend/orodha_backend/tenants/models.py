from django.db import models

from django_tenants.models import TenantMixin, DomainMixin

# Create your models here.
class Client(TenantMixin):
    name = models.CharField(
        max_length=255,
        unique=True
    )

    business_name = models.CharField(
        max_length=255
    )

    logo = models.CharField(
        max_length=255
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

    auto_create_schema = True


class Domain(DomainMixin):
    pass
