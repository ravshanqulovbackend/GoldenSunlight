from rest_framework import generics, permissions
from .models import ContactMessage
from .serializers import ContactMessageSerializer, ContactMessageAdminSerializer
from users.permissions import IsAdminRole


class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class AdminContactMessageListView(generics.ListAPIView):
    serializer_class = ContactMessageAdminSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['full_name', 'email', 'subject']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        return ContactMessage.objects.all()
