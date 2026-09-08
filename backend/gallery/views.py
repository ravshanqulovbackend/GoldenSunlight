from django.forms.models import model_to_dict
from rest_framework import viewsets, permissions
from .models import GalleryCategory, GalleryImage
from .serializers import GalleryCategorySerializer, GalleryImageSerializer
from users.permissions import IsAdminRole
from common.utils import log_activity, diff_instance


class GalleryCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer
    lookup_field = 'slug'


class GalleryImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer

    def get_queryset(self):
        qs = GalleryImage.objects.all()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)
        return qs


class AdminGalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.all()
    serializer_class = GalleryImageSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'created', instance, 'GalleryImage')

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        instance = serializer.save()
        log_activity(self.request.user, 'updated', instance, 'GalleryImage', diff_instance(before, instance))

    def perform_destroy(self, instance):
        log_activity(self.request.user, 'deleted', instance, 'GalleryImage')
        instance.delete()


class AdminGalleryCategoryViewSet(viewsets.ModelViewSet):
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'created', instance, 'GalleryCategory')

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        instance = serializer.save()
        log_activity(self.request.user, 'updated', instance, 'GalleryCategory', diff_instance(before, instance))

    def perform_destroy(self, instance):
        log_activity(self.request.user, 'deleted', instance, 'GalleryCategory')
        instance.delete()
