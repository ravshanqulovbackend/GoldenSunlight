from rest_framework import serializers
from .models import Favorite
from products.serializers import ProductListSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'product', 'product_id', 'created_at')
