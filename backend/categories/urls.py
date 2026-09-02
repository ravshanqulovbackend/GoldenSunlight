from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.CategoryViewSet, basename='category')

admin_router = DefaultRouter()
admin_router.register('', views.AdminCategoryViewSet, basename='admin-category')

urlpatterns = [
    # admin/ BIRINCHI — aks holda "admin" so'zi pastdagi slug-detail marshrutiga
    # (masalan /categories/<slug>/) tushib qolib, uni kategoriya slug'i deb
    # noto'g'ri talqin qiladi (404, admin viewset'ga hech qachon yetib bormaydi).
    path('admin/', include(admin_router.urls)),
    path('', include(router.urls)),
]
