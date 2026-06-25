from rest_framework import serializers

from .models import BookItem, Hub, InventoryMovement, Product


class HubSerializer(serializers.ModelSerializer):
    """
    Serialize a physical location where book stock can be stored.

    Hubs are referenced by users, book items, and inventory movements. Keep hub
    records stable because they become part of stock movement history.
    """

    class Meta:
        model = Hub
        fields = ["id", "name", "address", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    """
    Serialize book metadata shared by many physical copies.

    Product is the catalog-level record: title, ISBN, author, category, and base
    price. Individual copies are represented by BookItem.
    """

    class Meta:
        model = Product
        fields = ["id", "isbn", "title", "category", "author", "base_price", "created_at"]
        read_only_fields = ["id", "created_at"]


class BookItemSerializer(serializers.ModelSerializer):
    """
    Serialize one physical copy of a product.

    serial_number identifies the copy inside a tenant. current_hub and status
    describe where that copy is now and whether it is available, at a hub, or
    sold.
    """

    product_title = serializers.CharField(
        source="product.title",
        read_only=True
    )

    isbn = serializers.CharField(
        source="product.isbn",
        read_only=True
    )

    hub_name = serializers.CharField(
        source="current_hub.name",
        read_only=True
    )

    product_price = serializers.CharField(
        source="product.base_price",
        read_only=True
    )

    class Meta:
        model = BookItem
        fields = ["id", "product", "product_title", "isbn", "serial_number", "current_hub", "hub_name", "product_price", "status", "created_at"]
        read_only_fields = ["id", "created_at"]


class InventoryMovementSerializer(serializers.ModelSerializer):
    """
    Serialize stock movement history for a physical book copy.

    book_item is the copy being moved. from_hub and to_hub describe the route.
    For INGEST, from_hub can be null. For SALE, to_hub can be null depending on
    how you model stock leaving the system.
    """

    class Meta:
        model = InventoryMovement
        fields = ["id", "book_item", "from_hub", "to_hub", "action", "performed_by", "timestamp"]
        read_only_fields = ["id", "timestamp"]
