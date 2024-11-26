from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Cuenta, Tarjeta, Transferencia, Prestamo, Servicios
from .serializers import CuentaSerializer, TarjetaSerializer, TransferenciaSerializer, PrestamoSerializer, ServiciosSerializer

class CuentaViewSet(viewsets.ModelViewSet):
    serializer_class = CuentaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cuenta.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    def destroy(self, request, *args, **kwargs):
        cuenta = self.get_object()
        if cuenta.balance_pesos > 0 or cuenta.balance_dolares > 0:
            raise ValidationError("No puedes eliminar una cuenta con saldo.")
        if cuenta.tarjetas.exists():
            raise ValidationError("No puedes eliminar una cuenta con una tarjeta asociada activa.")
        return super().destroy(request, *args, **kwargs)

class TarjetaViewSet(viewsets.ModelViewSet):
    queryset = Tarjeta.objects.all()
    serializer_class = TarjetaSerializer

class TransferenciaViewSet(viewsets.ModelViewSet):
    queryset = Transferencia.objects.all()
    serializer_class = TransferenciaSerializer

class PrestamoViewSet(viewsets.ModelViewSet):
    queryset = Prestamo.objects.all()
    serializer_class = PrestamoSerializer

class PagoViewSet(viewsets.ModelViewSet):
    queryset = Servicios.objects.all()
    serializer_class = ServiciosSerializer
