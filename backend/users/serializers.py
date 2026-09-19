
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'role', 'pending_role', 'is_verified', 'email_verified', 'date_of_birth', 'created_at')
        read_only_fields = ('id', 'role', 'pending_role', 'is_verified', 'email_verified', 'created_at')

    def validate_email(self, value):
        # `ProfileView` (o'zini tahrirlash) va `AdminUserDetailView` (admin boshqa
        # userni tahrirlashi) ikkalasi ham shu serializer'dan foydalanadi — bu
        # tekshiruv bo'lmasa, `RegisterSerializer.validate_email`dagi email
        # takrorlanmasligi kafolati profil tahrirlash orqali aylanib o'tilardi.
        qs = User.objects.filter(email__iexact=value) if value else User.objects.none()
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("This email is already registered")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    # min_length yo'q — parol kuchi endi `validate()`da Django'ning
    # AUTH_PASSWORD_VALIDATORS (settings.py) orqali tekshiriladi, oddiy uzunlik
    # tekshiruvidan ancha kuchli (umumiy parollar, faqat raqamdan iborat parol,
    # username/email/ismga juda o'xshash parol — barchasi bloklanadi).
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'phone', 'password')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken")
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered")
        return value

    def validate_phone(self, value):
        if value and User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered")
        return value

    def validate(self, attrs):
        # `UserAttributeSimilarityValidator` parolni username/email/ism-familiyaga
        # solishtirish uchun User instansiyasini talab qiladi — hali saqlanmagan,
        # boshqa maydonlardan tuzilgan vaqtinchalik instansiya shu uchun yetarli.
        user = User(**{key: value for key, value in attrs.items() if key != 'password'})
        try:
            validate_password(attrs['password'], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class VerifyEmailSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6, min_length=6)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value
