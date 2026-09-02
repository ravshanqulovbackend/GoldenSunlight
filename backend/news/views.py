from rest_framework import viewsets, permissions
from .models import News
from .serializers import NewsListSerializer, NewsDetailSerializer
from users.permissions import IsAdminRole


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
