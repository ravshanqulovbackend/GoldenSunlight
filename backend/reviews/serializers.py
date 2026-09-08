from rest_framework import serializers
from common.serializers import FlexibleImageField
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    image = FlexibleImageField(required=False, allow_null=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_name', 'product', 'rating', 'comment', 'image', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class AdminReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    image = FlexibleImageField(read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_name', 'username', 'product', 'product_name', 'product_slug', 'rating', 'comment', 'image', 'created_at')
        read_only_fields = fields
