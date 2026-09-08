from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User


@admin.action(description="Grant admin role (activates once the profile is completed)")
def grant_pending_admin(modeladmin, request, queryset):
    eligible = queryset.exclude(role__in=['admin', 'superadmin'])
    updated = eligible.update(pending_role='admin')
    skipped = queryset.count() - updated
    message = f"Admin role marked as \"pending\" for {updated} user(s)."
    if skipped:
        message += f" {skipped} were skipped because they are already admin/superadmin."
    modeladmin.message_user(request, message)


@admin.action(description="Cancel pending role")
def cancel_pending_role(modeladmin, request, queryset):
    updated = queryset.exclude(pending_role='').update(pending_role='')
    modeladmin.message_user(request, f"Pending role cancelled for {updated} user(s).")


class UserAdmin(DjangoUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'pending_role', 'is_active')
    list_filter = DjangoUserAdmin.list_filter + ('role', 'pending_role')
    actions = [grant_pending_admin, cancel_pending_role]
    readonly_fields = DjangoUserAdmin.readonly_fields + ('pending_role',)
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Additional", {
            'fields': ('phone', 'avatar', 'role', 'pending_role', 'is_verified', 'email_verified', 'date_of_birth'),
        }),
    )


admin.site.register(User, UserAdmin)
