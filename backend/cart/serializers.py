from rest_framework import serializers
from .models import Cart, CartItem
from products.models import Product
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'subtotal')


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_price', 'total_items')

    def get_total_price(self, obj):
        items = obj.items.select_related('product').all()
        return sum(item.product.price * item.quantity for item in items)

    def get_total_items(self, obj):
        items = obj.items.all()
        return sum(item.quantity for item in items)


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1, min_value=1)

    def validate_product_id(self, value):
        try:
            product = Product.objects.get(pk=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Mahsulot topilmadi yoki faol emas")
        return value

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Miqdor kamida 1 bo'lishi kerak")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
