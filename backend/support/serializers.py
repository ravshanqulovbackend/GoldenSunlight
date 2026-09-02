from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import SupportMessage

User = get_user_model()


class SupportMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source='sender.role', read_only=True, default='')

    class Meta:
        model = SupportMessage
        fields = (
            'id', 'customer', 'sender', 'sender_name', 'sender_role',
            'message', 'image', 'is_read', 'created_at',
        )
        read_only_fields = ('id', 'customer', 'sender', 'is_read', 'created_at')

    def get_sender_name(self, obj):
        if not obj.sender:
            return ''
        return obj.sender.get_full_name() or obj.sender.username

    def validate(self, attrs):
        message = attrs.get('message', '') or ''
        image = attrs.get('image')
        if not message.strip() and not image:
            raise serializers.ValidationError("Xabar matni yoki rasm kiritilishi shart")
        return attrs


class ConversationSerializer(serializers.ModelSerializer):
    """`SupportMessage` emas — annotatsiyalangan `User` queryset ustida ishlaydi
    (`ConversationListView.get_queryset()` ga qarang)."""
    full_name = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.IntegerField(read_only=True)
    last_message_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'last_message', 'unread_count', 'last_message_at')

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_last_message(self, obj):
        last = obj.support_messages.order_by('-created_at').first()
        if not last:
            return ''
        if last.message:
            return last.message[:100]
        return "[rasm]" if last.image else ''
