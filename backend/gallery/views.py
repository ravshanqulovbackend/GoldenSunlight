from rest_framework import viewsets, permissions
from .models import GalleryCategory, GalleryImage
from .serializers import GalleryCategorySerializer, GalleryImageSerializer
from users.permissions import IsAdminRole


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


class AdminGalleryCategoryViewSet(viewsets.ModelViewSet):
    queryset = GalleryCategory.objects.all()
    serializer_class = GalleryCategorySerializer
    permission_classes = [IsAdminRole]
