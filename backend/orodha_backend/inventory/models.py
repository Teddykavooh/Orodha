from django.db import models

# Create your models here.
'''Hubs Model'''
class Hub(models.Model):
    name = models.CharField(
        max_length=255
    )

    address = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )


'''Product Model'''
class Product(models.Model):
    isbn = models.CharField(
        max_length=13,
        unique=True
    )

    title = models.CharField(
        max_length=255
    )

    category = models.CharField(
        max_length=255
    )

    author = models.CharField(
        max_length=255
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )


'''BookItem Model'''
class BookItem(models.Model):
    STATUS_CHOICES = (
        ("IN_WAREHOUSE", "In Warehouse"),
        ("AT_HUB", "At Hub"),
        ("SOLD", "Sold"),
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="copies"
    )

    serial_number = models.CharField(
        max_length=100,
        # unique=True
        # comes handy if tenants have the same serial number
        db_index=True
    )

    current_hub = models.ForeignKey(
        Hub,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="IN_WAREHOUSE"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        indexes = [
            models.Index(fields=["serial_number"]),
            models.Index(fields=["status"]),
            models.Index(fields=["current_hub"]),
        ]


'''Inventory Movement'''
class InventoryMovement(models.Model):
    ACTIONS = (
        ("INGEST", "Ingest"),
        ("TRANSFER", "Transfer"),
        ("SALE", "Sale"),
    )

    book_item = models.ForeignKey(
        Hub,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="from_movements"
    )

    to_hub = models.ForeignKey(
        Hub,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="to_movements"
    )

    action = models.CharField(
        max_length=20,
        choices=ACTIONS
    )

    performed_by = models.ForeignKey(
        "accounts.UserProfile",
        null=True,
        on_delete=models.SET_NULL
    )

    timestamp = models.DateTimeField(
        auto_now_add=True
    )