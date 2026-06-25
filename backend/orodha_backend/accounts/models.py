from django.db import models

from django.contrib.auth.models import AbstractUser

# Create your models here.
class UserProfile(AbstractUser):
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("MANAGER", "Manager"),
        ("MERCHANDISER", "Merchandiser"),
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES
    )

    # Disable accounts reliance to hub, will add hub accounts instead
    hub = models.ForeignKey(
        "inventory.Hub",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    # class UserHubAssignment(models.Model):
    # user = models.ForeignKey(
    #     settings.AUTH_USER_MODEL,
    #     on_delete=models.CASCADE
    # )

    # hub = models.ForeignKey(
    #     "inventory.Hub",
    #     on_delete=models.CASCADE
    # )

    # is_primary = models.BooleanField(default=True)