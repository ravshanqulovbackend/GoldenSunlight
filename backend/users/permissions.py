from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """
    Faqat admin yoki superadmin role'li foydalanuvchilar uchun.
    is_staff emas, custom role maydonini tekshiradi.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_admin_user
        )


class IsSuperAdminRole(permissions.BasePermission):
    """Faqat superadmin role'li foydalanuvchilar uchun (masalan, faoliyat jurnali)."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_superadmin
        )
