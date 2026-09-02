from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Favorite
from .serializers import FavoriteSerializer


class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class FavoriteToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'detail': 'product_id required'}, status=status.HTTP_400_BAD_REQUEST)
        fav, created = Favorite.objects.get_or_create(
            user=request.user, product_id=product_id
        )
        if not created:
            fav.delete()
            return Response({'favorited': False})
        return Response({'favorited': True}, status=status.HTTP_201_CREATED)


class FavoriteDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        try:
            fav = Favorite.objects.get(pk=pk, user=request.user)
            fav.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
