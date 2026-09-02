from rest_framework import serializers
from .models import News


class NewsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ('id', 'title', 'slug', 'summary', 'image', 'is_published', 'views_count', 'created_at')


class NewsDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ('id', 'title', 'slug', 'summary', 'content', 'image', 'is_published', 'views_count', 'created_at', 'updated_at')
