from rest_framework import serializers
from common.serializers import FlexibleImageField
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    # read_only EMAS — bitta serializer ham admin CRUD (rasm yuklash), ham public
    # o'qish uchun ishlatiladi (certificates/views.py).
    image = FlexibleImageField(required=False)

    class Meta:
        model = Certificate
        fields = (
            'id', 'title', 'title_ar', 'description', 'description_ar', 'image',
            'issued_by', 'issued_by_ar', 'issued_date', 'expiry_date', 'is_active', 'order',
        )
