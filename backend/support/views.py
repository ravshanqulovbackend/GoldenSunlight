from django.contrib.auth import get_user_model
from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from common.models import ActivityLog
from users.permissions import IsAdminRole, IsSuperAdminRole
from .models import SupportMessage
from .serializers import ConversationSerializer, SupportMessageSerializer

User = get_user_model()


class SupportMessageCreateView(generics.CreateAPIView):
    serializer_class = SupportMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_admin_user:
            customer = get_object_or_404(User, pk=self.request.data.get('customer'))
            serializer.save(customer=customer, sender=user, is_read=True, is_read_by_customer=False)
        else:
            serializer.save(customer=user, sender=user, is_read=False, is_read_by_customer=True)


class MyMessagesView(generics.ListAPIView):
    """Mijozning o'z suhbati — ochilganda adminning javoblarini 'o'qilgan' deb belgilaydi.
    Sahifalanmagan (xom massiv) — bitta suhbat butunligicha ko'rsatiladi, xuddi
    `ConversationDetailView.get()` kabi (ikkalasi ham bir xil shaklda javob qaytarishi
    kerak)."""
    serializer_class = SupportMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = SupportMessage.objects.filter(customer=self.request.user).select_related('sender')
        qs.filter(is_read_by_customer=False).update(is_read_by_customer=True)
        return qs


class MyUnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = SupportMessage.objects.filter(customer=request.user, is_read_by_customer=False).count()
        return Response({'unread_count': count})


class ConversationListView(generics.ListAPIView):
    """Yozgan mijozlar ro'yxati, oxirgi faollik bo'yicha (adminlar uchun)."""
    serializer_class = ConversationSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return (
            User.objects.filter(support_messages__isnull=False)
            .distinct()
            .annotate(
                # distinct=True SHART — bitta so'rovda Count+Max bir xil bog'lanish
                # ustida ishlatilganda, distinct'siz Count noto'g'ri (shishirilgan)
                # son berishi mumkin (Django'ning keng tarqalgan tuzog'i).
                unread_count=Count('support_messages', filter=Q(support_messages__is_read=False), distinct=True),
                last_message_at=Max('support_messages__created_at'),
            )
            .order_by('-last_message_at')
        )


class ConversationUnreadCountView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        count = SupportMessage.objects.filter(is_read=False).count()
        return Response({'unread_count': count})


class ConversationDetailView(APIView):
    """GET — suhbat tarixi (adminlar uchun o'qilgan deb belgilaydi).
    DELETE — butun suhbatni o'chirish, FAQAT superadmin."""

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [IsSuperAdminRole()]
        return [IsAdminRole()]

    def get(self, request, customer_id):
        messages = SupportMessage.objects.filter(customer_id=customer_id).select_related('sender')
        messages.filter(is_read=False).update(is_read=True)
        serializer = SupportMessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, customer_id):
        customer = get_object_or_404(User, pk=customer_id)
        messages = SupportMessage.objects.filter(customer=customer)
        count = messages.count()
        messages.delete()
        ActivityLog.objects.create(
            user=request.user,
            actor_display=request.user.get_full_name() or request.user.username,
            action='deleted',
            model_name='SupportMessage',
            object_id=customer.id,
            object_repr=f"{customer.get_full_name() or customer.username} bilan yozishma ({count} ta xabar)",
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
