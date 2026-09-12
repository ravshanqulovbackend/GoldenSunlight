from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'parent', 'image',
            'sort_order', 'is_active', 'product_count', 'meta_title', 'meta_title_ar',
            'meta_description', 'meta_description_ar',
        )

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()
