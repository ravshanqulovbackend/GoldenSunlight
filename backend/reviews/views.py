from rest_framework import generics, permissions, filters
from .models import Review
from .serializers import ReviewSerializer, AdminReviewSerializer
from users.permissions import IsAdminRole


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs.get('product_pk'))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, product_id=self.kwargs.get('product_pk'))


class AdminReviewListView(generics.ListAPIView):
    queryset = Review.objects.select_related('user', 'product').all()
    serializer_class = AdminReviewSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['comment', 'user__username', 'user__first_name', 'user__last_name', 'product__name']
    ordering_fields = ['created_at', 'rating', 'product__name']
    ordering = ['-created_at']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]


class AdminReviewDeleteView(generics.DestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = AdminReviewSerializer
    permission_classes = [IsAdminRole]

    def perform_destroy(self, instance):
        product = instance.product
        instance.delete()
        Review.recalculate_product_rating(product)
