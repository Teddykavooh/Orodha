from django.db import models

# Create your models here.
'''Sales Model'''
class SaleLog(models.Model):
    book_item  = models.ForeignKey(
        "inventory.BookItem",
        on_delete=models.PROTECT
    )

    product = models.ForeignKey(
        "inventory.Product",
        null=True,
        on_delete=models.PROTECT,
        related_name="sales_records"
    )

    hub = models.ForeignKey(
        "inventory.Hub",
        on_delete=models.PROTECT,
        null=True, 
        blank=True,
        related_name="sales_records"
    )

    quantity = models.PositiveIntegerField(
        default=1,
        help_text="Number of book copies purchased in this single transaction line"
    )

    salesperson = models.ForeignKey(
        "accounts.UserProfile",
        on_delete=models.PROTECT
    )

    sale_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="The total amount paid for this transaction row"
    )

    sold_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        hub_name = self.hub.name if self.hub else "Main Warehouse"
        return f"Sale: {self.quantity}x {self.product.title} at {hub_name} by {self.salesperson}"