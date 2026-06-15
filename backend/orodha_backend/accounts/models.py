from django.db import models

from django.contrib.auth.models import AbstractUser

# Create your models here.
class UserProfile(AbstractUser):
    ROLE_CHOICES = (
        ("WHOLESALER_ADMIN", "Wholesaler Admin"),
        ("SALES_MANAGER", "Sales Manager"),
        ("SALESPERSON", "Salesperson"),
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES
    )

    hub = models.ForeignKey(
        "inventory.Hub",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )