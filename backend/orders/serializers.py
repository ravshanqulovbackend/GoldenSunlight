from rest_framework import serializers
from .models import Order, OrderItem, Coupon, Address
from products.serializers import ProductListSerializer


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ('id', 'title', 'full_name', 'phone', 'city', 'district', 'street', 'building', 'apartment', 'landmark', 'is_default', 'created_at')
        read_only_fields = ('id', 'created_at')


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'variant', 'quantity', 'price', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    user = serializers.IntegerField(source='user_id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    # Admin order sahifasidagi "mijoz ko'rdimi" (ikki ptichka) belgisi uchun — eng
    # so'nggi status-o'zgarish bildirishnomasiga qarab. Mijozning o'zi bu ikkisini
    # ko'rsa ham hech qanday maxfiy narsa oshkor bo'lmaydi, shuning uchun serializer
    # umumiy — faqat admin frontend'i buni haqiqatan render qiladi.
    notification_sent = serializers.SerializerMethodField()
    notification_seen = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'username', 'status', 'status_display', 'full_name', 'phone', 'address', 'address_text',
            'landmark', 'notes', 'payment_method', 'payment_display', 'subtotal',
            'delivery_fee', 'discount_amount', 'tax_amount', 'total_amount',
            'coupon', 'tracking_number', 'items', 'created_at', 'updated_at',
            'notification_sent', 'notification_seen',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def _latest_notification(self, obj):
        # Ro'yxat view'lari (`OrderListCreateView`/`AdminOrderListView`) N+1 so'rovning
        # oldini olish uchun `notifications`ni `prefetched_notifications`ga
        # Prefetch(to_attr=...) bilan oldindan yuklaydi — shu bo'lsa uni ishlatamiz,
        # aks holda (bitta buyurtma qaytarilayotgan detail/action endpoint'lar) to'g'ridan-
        # to'g'ri so'rov beramiz. Har ikki holatda ham natija instance ustida keshlanadi —
        # bitta so'rovda `notification_sent` va `notification_seen` ikkisi ham chaqiradi.
        if not hasattr(obj, '_latest_notification_cache'):
            prefetched = getattr(obj, 'prefetched_notifications', None)
            if prefetched is not None:
                obj._latest_notification_cache = prefetched[0] if prefetched else None
            else:
                obj._latest_notification_cache = obj.notifications.order_by('-created_at').first()
        return obj._latest_notification_cache

    def get_notification_sent(self, obj):
        return self._latest_notification(obj) is not None

    def get_notification_seen(self, obj):
        latest = self._latest_notification(obj)
        return bool(latest and latest.is_read)


class CreateOrderSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20)
    address_id = serializers.IntegerField(required=False, allow_null=True)
    address_text = serializers.CharField(required=False, default='', allow_blank=True)
    landmark = serializers.CharField(required=False, default='', allow_blank=True)
    notes = serializers.CharField(required=False, default='', allow_blank=True)
    payment_method = serializers.ChoiceField(choices=['cash', 'card'])
    coupon_code = serializers.CharField(required=False, default='', allow_blank=True)


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount_percent', 'discount_amount', 'min_order_amount', 'is_active', 'expires_at')
        read_only_fields = ('id',)


class ValidateCouponSerializer(serializers.Serializer):
    code = serializers.CharField()
