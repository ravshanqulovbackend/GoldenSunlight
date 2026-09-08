from django.forms.models import model_to_dict
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from .models import Category
from .serializers import CategorySerializer
from users.permissions import IsAdminRole
from common.utils import log_activity, diff_instance, notify_superadmins


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class AdminCategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminRole]
    lookup_field = 'slug'
    search_fields = ['name', 'slug']
    ordering_fields = ['name', 'sort_order', 'created_at']

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'created', instance, 'Category')

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        # slug yaratilgandan keyin o'zgartirilmaydi — havolalar/bookmark'lar buzilmasin
        instance = serializer.save(slug=serializer.instance.slug)
        log_activity(self.request.user, 'updated', instance, 'Category', diff_instance(before, instance))

    def perform_destroy(self, instance):
        if instance.products.exists() or instance.children.exists():
            raise ValidationError(
                "This category has products or sub-categories — "
                "move or delete them first."
            )
        actor = self.request.user
        name = instance.name
        log_activity(actor, 'deleted', instance, 'Category')
        instance.delete()
        notify_superadmins(
            "Category deleted",
            f'{actor.get_full_name() or actor.username} permanently deleted the category "{name}".',
            exclude_user=actor,
        )
