from django.contrib import admin
from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('actor_display', 'action', 'model_name', 'object_repr', 'created_at')
    list_filter = ('action', 'model_name')
    search_fields = ('actor_display', 'object_repr')
    readonly_fields = ('user', 'actor_display', 'action', 'model_name', 'object_id', 'object_repr', 'changes', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
