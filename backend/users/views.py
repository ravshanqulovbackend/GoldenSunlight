from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Case, When, IntegerField
from .serializers import UserSerializer, RegisterSerializer, ChangePasswordSerializer
from .permissions import IsAdminRole

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = serializer.save()
        # Django admin orqali berilgan rol (pending_role) foydalanuvchi o'zi haqida
        # to'liq ma'lumot (ism, familiya, telefon, rasm) kiritgandan keyingina kuchga kiradi.
        if user.pending_role and user.first_name and user.last_name and user.phone and user.avatar:
            user.role = user.pending_role
            user.pending_role = ''
            user.save(update_fields=['role', 'pending_role'])


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Parol muvaffaqiyatli o\'zgartirildi'})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    # 'role_group' mijozlarni (staff) xodimlardan (admin/superadmin) ajratib
    # guruhlaydi — 'role' maydonining o'zi bo'yicha saralansa alifbo tartibida
    # "admin, staff, superadmin" bo'lib, mijozlar ikki xodim toifasi orasida
    # qolib ketardi.
    queryset = User.objects.annotate(
        role_group=Case(
            When(role='staff', then=0),
            default=1,
            output_field=IntegerField(),
        )
    )
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['created_at', 'username', 'first_name', 'role_group']
    ordering = ['-created_at']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]


def _guard_actor_vs_target(actor, target, new_role=None):
    """Admin/superadmin ierarxiyasi: hech kim o'zini o'zgartira/o'chira olmaydi,
    va oddiy admin superadminga (mavjud yoki bo'lajak) tega olmaydi."""
    if target.pk == actor.pk:
        raise PermissionDenied("O'zingizga nisbatan bu amalni bajara olmaysiz.")
    if actor.role == 'admin' and (target.role == 'superadmin' or new_role == 'superadmin'):
        raise PermissionDenied("Superadmin bilan bog'liq amalni faqat superadmin bajara oladi.")


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        role = request.data.get('role')
        if role and role in dict(User.ROLE_CHOICES):
            _guard_actor_vs_target(request.user, user, new_role=role)
            user.role = role
            user.save()
        return super().update(request, *args, **kwargs)

    def perform_destroy(self, instance):
        _guard_actor_vs_target(self.request.user, instance)
        if instance.role == 'superadmin' and not User.objects.filter(role='superadmin').exclude(pk=instance.pk).exists():
            raise PermissionDenied("Oxirgi superadminni o'chirib bo'lmaydi.")
        if instance.orders.exists():
            raise ValidationError("Buyurtmalari mavjud foydalanuvchini o'chirib bo'lmaydi.")
        instance.delete()
