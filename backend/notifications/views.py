from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """Sahifalanmagan — bitta userning butun bildirishnoma tarixi (`support`dagi
    `MyMessagesView` bilan bir xil sabab: DEFAULT_PAGINATION_CLASS ostida faqat
    birinchi sahifa (12 ta) qaytarilardi, va frontend hech qachon keyingi sahifani
    so'ramagani uchun 12tadan eskilari doim ko'rinmas bo'lib qolardi)."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        if pk:
            try:
                notification = Notification.objects.get(pk=pk, user=request.user)
                notification.is_read = True
                notification.save(update_fields=['is_read'])
            except Notification.DoesNotExist:
                return Response({'detail': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'detail': 'Updated'})
