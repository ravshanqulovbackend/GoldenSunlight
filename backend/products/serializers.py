from rest_framework import serializers
from common.serializers import FlexibleImageField
from .models import Product, ProductImage, ProductVariant, Brand


class BrandSerializer(serializers.ModelSerializer):
    image = FlexibleImageField(read_only=True)

    class Meta:
        model = Brand
        fields = ('id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'image', 'is_active')


class ProductImageSerializer(serializers.ModelSerializer):
    image = FlexibleImageField(read_only=True)

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'order')


class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ('id', 'name', 'sku', 'price_adjustment', 'final_price', 'stock', 'is_active')


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_name_ar = serializers.CharField(source='category.name_ar', read_only=True, default='')
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_name_ar = serializers.CharField(source='brand.name_ar', read_only=True, default='')
    discount_percent = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    image = FlexibleImageField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'name_ar', 'slug', 'price', 'old_price', 'discount_percent',
            'image', 'badge', 'badge_ar', 'is_popular', 'is_featured', 'rating', 'review_count',
            'category', 'category_name', 'category_name_ar', 'brand', 'brand_name', 'brand_name_ar', 'stock', 'is_in_stock',
            'average_rating', 'sku',
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_name_ar = serializers.CharField(source='category.name_ar', read_only=True, default='')
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_name_ar = serializers.CharField(source='brand.name_ar', read_only=True, default='')
    discount_percent = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    image = FlexibleImageField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'price', 'old_price',
            'discount_percent', 'image', 'ingredients', 'ingredients_ar', 'badge', 'badge_ar', 'sku', 'stock',
            'is_active', 'is_popular', 'is_featured', 'rating', 'review_count',
            'category', 'category_name', 'category_name_ar', 'brand', 'brand_name', 'brand_name_ar',
            'images', 'variants', 'is_in_stock', 'average_rating',
            'meta_title', 'meta_title_ar', 'meta_description', 'meta_description_ar', 'created_at',
        )


class ProductAdminSerializer(serializers.ModelSerializer):
    """
    Admin panel uchun ATAYLAB alohida serializer — ProductList/DetailSerializer'dagi
    `image = FlexibleImageField(read_only=True)` yozishga to'sqinlik qiladi, va ular
    list/detail bo'yicha bo'lingan bo'lib, bitta yozish formasiga mos kelmaydi.
    `image` shu yerda FlexibleImageField, lekin read_only=True SIZ — yozish uchun ochiq.
    """
    image = FlexibleImageField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_name_ar = serializers.CharField(source='category.name_ar', read_only=True, default='')
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    brand_name_ar = serializers.CharField(source='brand.name_ar', read_only=True, default='')
    discount_percent = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'name_ar', 'slug', 'description', 'description_ar', 'price', 'old_price',
            'discount_percent', 'image', 'ingredients', 'ingredients_ar', 'badge', 'badge_ar', 'sku', 'stock',
            'is_active', 'is_popular', 'is_featured', 'rating', 'review_count',
            'category', 'category_name', 'category_name_ar', 'brand', 'brand_name', 'brand_name_ar', 'is_in_stock',
            'meta_title', 'meta_title_ar', 'meta_description', 'meta_description_ar',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'rating', 'review_count', 'created_at', 'updated_at')


class ProductRelatedSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_name_ar = serializers.CharField(source='category.name_ar', read_only=True, default='')
    average_rating = serializers.FloatField(read_only=True)
    image = FlexibleImageField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'name_ar', 'slug', 'price', 'old_price', 'image',
            'category_name', 'category_name_ar', 'rating', 'average_rating',
        )
