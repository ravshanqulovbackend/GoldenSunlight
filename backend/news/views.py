from django.forms.models import model_to_dict
from rest_framework import viewsets, permissions
from .models import News
from .serializers import NewsListSerializer, NewsDetailSerializer
from users.permissions import IsAdminRole
from common.utils import log_activity, diff_instance


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.filter(is_published=True)
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return NewsDetailSerializer
        return NewsListSerializer


class AdminNewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsDetailSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['title']
    ordering_fields = ['created_at', 'title']

    def perform_create(self, serializer):
        instance = serializer.save()
        log_activity(self.request.user, 'created', instance, 'News')

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        instance = serializer.save()
        log_activity(self.request.user, 'updated', instance, 'News', diff_instance(before, instance))

    def perform_destroy(self, instance):
        log_activity(self.request.user, 'deleted', instance, 'News')
        instance.delete()
