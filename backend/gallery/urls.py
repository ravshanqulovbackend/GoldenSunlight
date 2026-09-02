from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('categories', views.GalleryCategoryViewSet, basename='gallery-category')
router.register('images', views.GalleryImageViewSet, basename='gallery-image')

admin_router = DefaultRouter()
admin_router.register('categories', views.AdminGalleryCategoryViewSet, basename='admin-gallery-category')
admin_router.register('images', views.AdminGalleryImageViewSet, basename='admin-gallery-image')

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
]
