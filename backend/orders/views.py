from django.db import transaction
from rest_framework import generics, permissions, status, filters
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem, Coupon, Address
from .serializers import OrderSerializer, CreateOrderSerializer, AddressSerializer, ValidateCouponSerializer
from cart.models import Cart
from products.models import Product
from notifications.models import Notification
from users.permissions import IsAdminRole

TERMINAL_STATUSES = ('delivered', 'cancelled', 'refunded')


def _adjust_stock(product, delta):
    """delta > 0 — zaxiradan kamaytiradi (yetarli bo'lmasa xato), delta < 0 — qaytaradi."""
    if delta > 0 and product.stock < delta:
        raise ValidationError(f"{product.name} uchun yetarli zaxira yo'q ({product.stock} ta qoldi)")
    product.stock -= delta
    product.save(update_fields=['stock'])


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product__category', 'items__product__brand')

    def create(self, request, *args, **kwargs):
        if request.user.is_admin_user:
            return Response({'detail': 'Admin va superadmin buyurtma bera olmaydi'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({'detail': 'Savat bo\'sh'}, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related('product').all()
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        delivery_fee = 15000
        discount = 0
        coupon = None

        # Stock tekshirish
        for cart_item in cart_items:
            if cart_item.product.stock < cart_item.quantity:
                return Response(
                    {'detail': f'{cart_item.product.name} mahsulotida yetarli zaxira yo\'q ({cart_item.product.stock} ta qoldi)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if data.get('coupon_code'):
            try:
                coupon = Coupon.objects.get(code=data['coupon_code'], is_active=True)
                if coupon.is_valid and subtotal >= coupon.min_order_amount:
                    if coupon.discount_percent > 0:
                        discount = subtotal * coupon.discount_percent / 100
                    else:
                        discount = coupon.discount_amount
                    coupon.used_count += 1
                    coupon.save()
            except Coupon.DoesNotExist:
                pass

        total = max(subtotal + delivery_fee - discount, 0)
        address_text = data.get('address_text', '')
        if data.get('address_id'):
            try:
                addr = Address.objects.get(pk=data['address_id'], user=request.user)
                address_text = f'{addr.city}, {addr.district}, {addr.street}, {addr.building}'
            except Address.DoesNotExist:
                pass

        order = Order.objects.create(
            user=request.user,
            full_name=data['full_name'],
            phone=data['phone'],
            address_text=address_text,
            landmark=data.get('landmark', ''),
            notes=data.get('notes', ''),
            payment_method=data['payment_method'],
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount_amount=discount,
            total_amount=total,
            coupon=coupon,
        )
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
            )
            # Stock kamaytirish
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save(update_fields=['stock'])
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({'detail': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)
        if order.status not in ('pending', 'confirmed'):
            return Response({'detail': 'Bu buyurtmani bekor qilib bo\'lmaydi'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'cancelled'
        order.save()
        # Stockni qaytarish
        for item in order.items.select_related('product').all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save(update_fields=['stock'])
        return Response(OrderSerializer(order).data)


class ValidateCouponView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ValidateCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            coupon = Coupon.objects.get(code=serializer.validated_data['code'], is_active=True)
            if not coupon.is_valid:
                return Response({'detail': 'Kupon muddati tugagan yoki limiti oshgan'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                'code': coupon.code,
                'discount_percent': str(coupon.discount_percent),
                'discount_amount': str(coupon.discount_amount),
                'min_order_amount': str(coupon.min_order_amount),
            })
        except Coupon.DoesNotExist:
            return Response({'detail': 'Kupon topilmadi'}, status=status.HTTP_404_NOT_FOUND)


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]
    search_fields = ['full_name', 'phone', 'tracking_number']
    ordering_fields = ['created_at', 'total_amount', 'status']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        return Order.objects.select_related('user').prefetch_related('items__product__category', 'items__product__brand').all()


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return Order.objects.select_related('user').prefetch_related('items__product__category', 'items__product__brand').all()


class AdminOrderStatusView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get('status')
        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'detail': 'Noto\'g\'ri status'}, status=status.HTTP_400_BAD_REQUEST)
        # Bekor qilish/qaytarishga o'tilganda (avval shunday bo'lmagan bo'lsa) zaxira qaytariladi —
        # mijozning o'zi bekor qilgandagi CancelOrderView bilan bir xil xulq-atvor.
        if new_status in ('cancelled', 'refunded') and order.status not in ('cancelled', 'refunded'):
            for item in order.items.select_related('product').all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save(update_fields=['stock'])
        order.status = new_status
        if request.data.get('tracking_number'):
            order.tracking_number = request.data['tracking_number']
        order.save()
        return Response(OrderSerializer(order).data)


class AdminOrderItemCreateView(APIView):
    """Mavjud buyurtmaga yangi mahsulot qo'shish."""
    permission_classes = [IsAdminRole]

    @transaction.atomic
    def post(self, request, pk):
        try:
            order = Order.objects.select_for_update().get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)
        if order.status in TERMINAL_STATUSES:
            return Response({'detail': 'Yakunlangan buyurtmani tahrirlab bo\'lmaydi'}, status=status.HTTP_400_BAD_REQUEST)

        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))
        if quantity < 1:
            return Response({'detail': 'Miqdor kamida 1 bo\'lishi kerak'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.select_for_update().get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'detail': 'Mahsulot topilmadi'}, status=status.HTTP_404_NOT_FOUND)
        if order.items.filter(product=product).exists():
            return Response(
                {'detail': 'Bu mahsulot buyurtmada allaqachon bor — miqdorini o\'zgartiring'},
                status=status.HTTP_400_BAD_REQUEST
            )

        _adjust_stock(product, quantity)
        OrderItem.objects.create(order=order, product=product, product_name=product.name, quantity=quantity, price=product.price)
        order.recalculate_totals()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class AdminOrderItemDetailView(APIView):
    """Buyurtmadagi bitta mahsulot qatorini tahrirlash/o'chirish."""
    permission_classes = [IsAdminRole]

    @transaction.atomic
    def patch(self, request, pk, item_id):
        order, item = self._get_order_and_item(pk, item_id)
        if order.status in TERMINAL_STATUSES:
            return Response({'detail': 'Yakunlangan buyurtmani tahrirlab bo\'lmaydi'}, status=status.HTTP_400_BAD_REQUEST)

        new_quantity = int(request.data.get('quantity', 0))
        if new_quantity < 1:
            return Response({'detail': 'Miqdor kamida 1 bo\'lishi kerak — o\'chirish uchun DELETE ishlating'}, status=status.HTTP_400_BAD_REQUEST)

        if item.product:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            _adjust_stock(product, new_quantity - item.quantity)
        item.quantity = new_quantity
        item.save(update_fields=['quantity'])
        order.recalculate_totals()
        return Response(OrderSerializer(order).data)

    @transaction.atomic
    def delete(self, request, pk, item_id):
        order, item = self._get_order_and_item(pk, item_id)
        if order.status in TERMINAL_STATUSES:
            return Response({'detail': 'Yakunlangan buyurtmani tahrirlab bo\'lmaydi'}, status=status.HTTP_400_BAD_REQUEST)
        if order.items.count() <= 1:
            return Response(
                {'detail': 'Buyurtmadagi oxirgi mahsulotni o\'chirib bo\'lmaydi — to\'liq bekor qilish uchun statusni o\'zgartiring'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if item.product:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            _adjust_stock(product, -item.quantity)
        item.delete()
        order.recalculate_totals()
        return Response(OrderSerializer(order).data)

    def _get_order_and_item(self, pk, item_id):
        try:
            order = Order.objects.select_for_update().get(pk=pk)
        except Order.DoesNotExist:
            raise NotFound({'detail': 'Buyurtma topilmadi'})
        try:
            item = order.items.get(pk=item_id)
        except OrderItem.DoesNotExist:
            raise NotFound({'detail': 'Buyurtma qatori topilmadi'})
        return order, item


class AdminOrderNotifyReadyView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Buyurtma topilmadi'}, status=status.HTTP_404_NOT_FOUND)
        Notification.objects.create(
            user=order.user,
            title=f'Buyurtma #{order.id} tayyor!',
            message=f'Buyurtmangiz (#{order.id}) tayyor bo\'ldi va yetkazib berish/olib ketish uchun kutmoqda.',
        )
        return Response({'detail': 'Xabar yuborildi'})
