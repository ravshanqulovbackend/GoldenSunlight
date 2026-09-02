from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer


class PaymentCreateView(generics.CreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        order = serializer.validated_data['order']
        if order.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Bu buyurtma sizga tegishli emas")
        serializer.save()
