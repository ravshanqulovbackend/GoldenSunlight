from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'parent', 'image', 'sort_order', 'is_active', 'product_count')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()
