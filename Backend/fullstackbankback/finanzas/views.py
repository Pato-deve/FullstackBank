from rest_framework.response import Response
from rest_framework.decorators import action
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
    serializer_class = TransferenciaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user
        return Transferencia.objects.filter(cuenta_origen__usuario=usuario).order_by('-fecha')

    def perform_create(self, serializer):
        cuenta_origen = serializer.validated_data['cuenta_origen']
        if cuenta_origen.usuario != self.request.user:
            raise serializer.ValidationError('No tienes permiso para usar esta cuenta como origen.')
        serializer.save()

class PrestamoViewSet(viewsets.ModelViewSet):
    serializer_class = PrestamoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user
        return Prestamo.objects.filter(cuenta__usuario=usuario)

    @action(detail=False, methods=['get'])
    def activos(self,request):
        prestamos_activos = self.get_queryset().filter(estado='activo')
        serializer = self.get_serializer(prestamos_activos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pagados(self,request):
        prestamos_pagados = self.get_queryset().filter(estado='pagado')
        serializer = self.get_serializer(prestamos_pagados, many=True)
        return Response(serializer.data)

class PagoViewSet(viewsets.ModelViewSet):
    queryset = Servicios.objects.all()
    serializer_class = ServiciosSerializer
