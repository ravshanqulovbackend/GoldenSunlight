from rest_framework import serializers
from common.serializers import FlexibleImageField
from .models import GalleryCategory, GalleryImage


class GalleryCategorySerializer(serializers.ModelSerializer):
    image_count = serializers.SerializerMethodField()

    class Meta:
        model = GalleryCategory
        fields = ('id', 'name', 'slug', 'image_count')

    def get_image_count(self, obj):
        return obj.images.count()


class GalleryImageSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    # read_only EMAS — bitta serializer ham admin CRUD (rasm yuklash), ham public
    # o'qish uchun ishlatiladi (gallery/views.py).
    image = FlexibleImageField()

    class Meta:
        model = GalleryImage
        fields = ('id', 'title', 'description', 'image', 'category', 'category_name', 'is_featured', 'order', 'created_at')
