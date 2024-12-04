from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from .models import Cuenta, Tarjeta, Transferencia, Prestamo, Servicios
from .serializers import CuentaSerializer, TarjetaSerializer, TransferenciaSerializer, PrestamoSerializer, ServiciosSerializer
from sucursales.permissions import EsEmpleado


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
    serializer_class = TarjetaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user
        return Tarjeta.objects.filter(cuenta__usuario=usuario)

    def perform_create(self, serializer):
        cuenta = serializer.validated_data['cuenta']
        if cuenta.usuario != self.request.user:
            raise ValidationError("No puedes agregar una tarjeta a una cuenta que no sea del usuario")
        serializer.save()


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
    permission_classes = [IsAuthenticated, EsEmpleado]

    def get_queryset(self):
        usuario = self.request.user
        if usuario.es_empleado:
            return Prestamo.objects.select_related('cuenta', 'cuenta__usuario').filter(
                cuenta__usuario__sucursal=usuario.sucursal)
        return Prestamo.objects.none()

    def perform_create(self, serializer):
        try:
            cuenta = serializer.validated_data['cuenta']
            if cuenta.usuario.sucursal != self.request.user.sucursal:
                raise serializers.ValidationError('No puedes registrar un préstamo para un cliente de otra sucursal.')
            serializer.save()
        except KeyError as e:
            raise serializers.ValidationError(f"Falta el campo obligatorio: {str(e)}")

    @action(detail=False, methods=['get'])
    def activos(self, request):
        prestamos_activos = self.get_queryset().filter(estado='activo')
        serializer = self.get_serializer(prestamos_activos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pagados(self, request):
        prestamos_pagados = self.get_queryset().filter(estado='pagado')
        serializer = self.get_serializer(prestamos_pagados, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        prestamo = self.get_object()
        try:
            prestamo.anular()
            serializer = self.get_serializer(prestamo)
            return Response({'mensaje': 'Préstamo anulado', 'prestamo': serializer.data}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PagoViewSet(viewsets.ModelViewSet):
    serializer_class = ServiciosSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Servicios.objects.filter(cuenta__usuario=self.request.user).order_by('-fecha_pago')

    def perform_create(self, serializer):
        cuenta = serializer.validated_data['cuenta']
        monto = serializer.validated_data['monto']

        if cuenta.usuario != self.request.user:
            raise serializers.ValidationError("La cuenta no pertenece al usuario autenticado.")

        if cuenta.balance_pesos < monto:
            raise serializers.ValidationError("El balance de la cuenta es insuficiente.")

        cuenta.balance_pesos -= monto
        cuenta.save()

        serializer.save()


class ResumenFinancieroView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = self.request.user

        cuentas = Cuenta.objects.filter(usuario=usuario)
        balance_pesos = sum(cuenta.balance_pesos for cuenta in cuentas)
        balance_dolares = sum(cuenta.balance_dolares for cuenta in cuentas)

        prestamos_activos = Prestamo.objects.filter(cuenta__usuario=usuario, estado='activo')
        total_pendiente = sum(prestamo.pago_total for prestamo in prestamos_activos)
        proxima_cuota = sum(prestamo.cuota_mensual for prestamo in prestamos_activos)

        transferencias = Transferencia.objects.filter(cuenta_origen__usuario=usuario).order_by('-fecha')[:5]
        transferencias_data = [
            {
                "cuenta_origen": transferencia.cuenta_origen.id,
                "cuenta_destino": transferencia.cuenta_destino.id,
                "monto": transferencia.monto,
                "fecha": transferencia.fecha,
                "descripcion": transferencia.descripcion,
            }
            for transferencia in transferencias
        ]

        ultimo_mes = datetime.now() - timedelta(days=30)
        pagos = Servicios.objects.filter(cuenta__usuario=usuario, fecha_pago__gte=ultimo_mes)
        pagos_data = [
            {
                "servicio": pago.servicio,
                "monto": pago.monto,
                "estado": pago.estado,
                "fecha_pago": pago.fecha_pago,
            }
            for pago in pagos
        ]

        resumen = {
            "balances_totales": {
                "pesos": balance_pesos,
                "dolares": balance_dolares,
            },
            "prestamos": {
                "total_pendiente": total_pendiente,
                "proxima_cuota": proxima_cuota,
                "cantidad_activos": prestamos_activos.count(),
            },
            "transferencias_recientes": transferencias_data,
            "pagos_recientes": pagos_data,
        }
        return Response(resumen)
