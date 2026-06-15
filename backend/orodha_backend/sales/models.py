from django.db import models

# Create your models here.
'''Sales Model'''
class SaleLog(models.Model):
    book_item = models.ForeignKey(
        "inventory.BookItem",
        on_delete=models.PROTECT
    )

    salesperson = models.ForeignKey(
        "accounts.UserProfile",
        on_delete=models.PROTECT
    )

    sale_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    sold_at = models.DateTimeField(
        auto_now_add=True
    )