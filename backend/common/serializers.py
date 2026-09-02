from rest_framework import serializers
from .models import ActivityLog


class FlexibleImageField(serializers.ImageField):
    """Returns external URLs as-is, local files with MEDIA_URL prefix."""
    def to_representation(self, value):
        if not value:
            return ''
        url = str(value)
        if url.startswith('http://') or url.startswith('https://'):
            return url
        if hasattr(value, 'url'):
            return value.url
        return url


class ActivityLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = (
            'id', 'actor_display', 'action', 'action_display', 'model_name',
            'object_id', 'object_repr', 'changes', 'created_at',
        )
