import logging

from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Case, When, IntegerField
from django.forms.models import model_to_dict
from .serializers import UserSerializer, RegisterSerializer, VerifyEmailSerializer, ChangePasswordSerializer
from .permissions import IsAdminRole
from .tasks import generate_and_send_verification_code, is_code_expired
from common.utils import log_activity, diff_instance

User = get_user_model()
logger = logging.getLogger(__name__)


def _try_send_verification_code(user):
    """Email yuborish account yaratish/yangilashning asosiy oqimini hech qachon
    buzmasligi kerak (SMTP vaqtincha ishlamasa ham) — shuning uchun xatolik faqat
    loglanadi. Aniq "resend" so'rovi esa (ResendVerificationEmailView) buni ataylab
    qilmaydi: u yerda foydalanuvchi natijani bilishi kerak."""
    try:
        generate_and_send_verification_code(user)
    except Exception:
        logger.exception('Failed to send verification email to user %s', user.pk)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    # O'zining 'register' chelagi — `config/settings.py`dagi umumiy 'anon' chelagidan
    # ancha qattiqroq va mustaqil (bir botning ko'plab akkaunt ochishga urinishi
    # saytni ko'zdan kechirayotgan haqiqiy mijozlarga ta'sir qilmasin uchun).
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Email kiritilgan bo'lsa ham — akkaunt darhol, to'liq ishlaydigan holda
        # yaratiladi (email tasdiqlanishi buni bloklamaydi, faqat `email_verified`
        # keyinroq true bo'ladi).
        if user.email:
            _try_send_verification_code(user)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    # 6 xonali kod — cheklovsiz bo'lsa "brute force" qilib bo'ladi (config/settings.py).
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'email_verify'

    def post(self, request):
        user = request.user
        if user.email_verified:
            return Response({'detail': 'Email is already verified'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.email:
            return Response({'detail': 'Add an email address to your profile first'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = VerifyEmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not user.email_verification_code or is_code_expired(user):
            return Response({'code': ['This code has expired — request a new one']}, status=status.HTTP_400_BAD_REQUEST)
        if serializer.validated_data['code'] != user.email_verification_code:
            return Response({'code': ['Incorrect code']}, status=status.HTTP_400_BAD_REQUEST)
        user.email_verified = True
        user.email_verification_code = ''
        user.email_verification_sent_at = None
        user.save(update_fields=['email_verified', 'email_verification_code', 'email_verification_sent_at'])
        # To'liq User qaytariladi — `updateProfile`dagi kabi — frontend Zustand
        # store'ni (`setUser`) qayta so'rov yubormasdan darhol yangilay olishi uchun.
        return Response(UserSerializer(user).data)


class ResendVerificationEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'email_verify_resend'

    def post(self, request):
        user = request.user
        if user.email_verified:
            return Response({'detail': 'Email is already verified'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.email:
            return Response({'detail': 'Add an email address to your profile first'}, status=status.HTTP_400_BAD_REQUEST)
        # Bu yerda xatolik yashirilmaydi (yuqoridagi `_try_send_verification_code`dan
        # farqli) — foydalanuvchi ataylab "qayta yubor" bosgan, natijani bilishi kerak.
        generate_and_send_verification_code(user)
        return Response({'detail': 'Verification code sent'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        previous_email = serializer.instance.email
        user = serializer.save()
        # Django admin orqali berilgan rol (pending_role) foydalanuvchi o'zi haqida
        # to'liq ma'lumot (ism, familiya, telefon, rasm) kiritgandan keyingina kuchga kiradi.
        if user.pending_role and user.first_name and user.last_name and user.phone and user.avatar:
            user.role = user.pending_role
            user.pending_role = ''
            user.save(update_fields=['role', 'pending_role'])
        # Eski email uchun tasdiq yangi (hali tekshirilmagan) manzilga ko'chib
        # o'tmasin — email o'zgargan bo'lsa qayta "tasdiqlanmagan" holatga qaytariladi
        # va agar yangi manzil bo'sh bo'lmasa, unga darhol yangi kod yuboriladi.
        if user.email != previous_email:
            user.email_verified = False
            user.email_verification_code = ''
            user.email_verification_sent_at = None
            user.save(update_fields=['email_verified', 'email_verification_code', 'email_verification_sent_at'])
            if user.email:
                _try_send_verification_code(user)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password changed successfully'})


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
    """Admin/superadmin hierarchy: nobody can modify/delete themselves, and a
    regular admin cannot touch another admin/superadmin (existing or future) —
    admin only manages customers (staff), staff members are managed by superadmin only."""
    if target.pk == actor.pk:
        raise PermissionDenied("You cannot perform this action on yourself.")
    if actor.role == 'admin' and (
        target.role in ('admin', 'superadmin') or new_role in ('admin', 'superadmin')
    ):
        raise PermissionDenied("Only a superadmin can perform actions involving an admin/superadmin.")


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        role = request.data.get('role')
        if role and role in dict(User.ROLE_CHOICES):
            _guard_actor_vs_target(request.user, user, new_role=role)
            if role == 'superadmin' and User.objects.filter(role='superadmin').exclude(pk=user.pk).exists():
                raise ValidationError("There can only be one superadmin.")
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        before = model_to_dict(serializer.instance)
        role = self.request.data.get('role')
        # 'role' — UserSerializer'da read_only, shuning uchun serializer.save() orqali
        # emas, .save(role=...) qo'shimcha argumenti bilan yoziladi (validate_data'ni chetlab).
        if role and role in dict(User.ROLE_CHOICES):
            instance = serializer.save(role=role)
        else:
            instance = serializer.save()
        log_activity(self.request.user, 'updated', instance, 'User', diff_instance(before, instance))

    def perform_destroy(self, instance):
        _guard_actor_vs_target(self.request.user, instance)
        if instance.role == 'superadmin' and not User.objects.filter(role='superadmin').exclude(pk=instance.pk).exists():
            raise PermissionDenied("Cannot delete the last superadmin.")
        if instance.orders.exists():
            raise ValidationError("Cannot delete a user who has existing orders.")
        log_activity(self.request.user, 'deleted', instance, 'User')
        instance.delete()
