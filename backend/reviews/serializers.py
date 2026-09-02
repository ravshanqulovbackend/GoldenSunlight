from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_name', 'product', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')


class AdminReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'user', 'user_name', 'username', 'product', 'product_name', 'product_slug', 'rating', 'comment', 'created_at')
        read_only_fields = fields
