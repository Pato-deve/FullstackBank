from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import viewsets, permissions, serializers, status
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from .models import Cuenta, Tarjeta, Transferencia, Prestamo, Servicios
from .serializers import CuentaSerializer, TarjetaSerializer, TransferenciaSerializer, PrestamoSerializer, ServiciosSerializer
from sucursales.permissions import EsEmpleado
from usuarios.models import Usuario
from django.db import transaction


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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = self.request.user
        return Tarjeta.objects.filter(cuenta__usuario=usuario)

    @action(detail=False, methods=['get'])
    def buscar_por_usuario(self, request):
        usuario_id = request.query_params.get('usuario_id')
        if not usuario_id:
            return Response({"error": "Se requiere el parámetro 'usuario_id'."}, status=400)

        tarjetas = Tarjeta.objects.filter(cuenta__usuario__id=usuario_id)
        serializer = self.get_serializer(tarjetas, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        cuenta = serializer.validated_data['cuenta']
        if cuenta.usuario != self.request.user:
            raise ValidationError("No puedes agregar una tarjeta a una cuenta que no sea del usuario")
        serializer.save()


class TransferenciaViewSet(viewsets.ModelViewSet):
    queryset = Transferencia.objects.all()
    serializer_class = TransferenciaSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        destinatario = request.data.get("destinatario")
        monto = request.data.get("monto")
        descripcion = request.data.get("descripcion")

        if not destinatario or not monto:
            return Response({"error": "El destinatario y el monto son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)

        cuenta_destino = None
        try:
            if '-' in destinatario:
                cuenta_destino = Cuenta.objects.get(numero_cuenta=destinatario)
            else:
                usuario_destino = Usuario.objects.get(username=destinatario)
                cuenta_destino = Cuenta.objects.get(usuario=usuario_destino)
        except (Cuenta.DoesNotExist, Usuario.DoesNotExist):
            return Response({"error": "Destinatario no encontrado"}, status=status.HTTP_400_BAD_REQUEST)

        cuenta_origen = Cuenta.objects.get(usuario=request.user)
        if cuenta_origen.balance_pesos < monto:
            return Response({"error": "Saldo insuficiente"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                transferencia = Transferencia.objects.create(
                    cuenta_origen=cuenta_origen,
                    cuenta_destino=cuenta_destino,
                    monto=monto,
                    descripcion=descripcion,
                    username_emisor=request.user.username
                )

                cuenta_origen.balance_pesos -= monto
                cuenta_origen.save()

                cuenta_destino.balance_pesos += monto
                cuenta_destino.save()

                username_receptor = cuenta_destino.usuario.username

                transferencia.username_receptor = username_receptor
                transferencia.save()

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        serializer = TransferenciaSerializer(transferencia)

        transferencia_data = serializer.data
        transferencia_data["username_receptor"] = username_receptor

        return Response(transferencia_data, status=status.HTTP_201_CREATED)

class EsEmpleadoOUsuarioPropio(BasePermission):
    # acceso si es empleado o si es el usuario dueño del préstamo.
    def has_permission(self, request, view):
        if hasattr(request.user, 'es_empleado') and request.user.es_empleado:
            return True
        return view.action in ['list', 'retrieve', 'create']

    def has_object_permission(self, request, view, obj):
        return request.user == obj.cuenta.usuario or (request.user.es_empleado if hasattr(request.user, 'es_empleado') else False)

class PrestamoViewSet(viewsets.ModelViewSet):
    serializer_class = PrestamoSerializer
    permission_classes = [IsAuthenticated, EsEmpleadoOUsuarioPropio]

    def get_queryset(self):
        user = self.request.user
        if user.es_empleado:
            return Prestamo.objects.select_related('cuenta', 'cuenta__usuario').filter(
                cuenta__usuario__sucursal=user.sucursal
            )
        return Prestamo.objects.filter(cuenta__usuario=user)

    def perform_create(self, serializer):
        serializer.save()


    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, EsEmpleado])
    def activos(self, request):
        # Solo empleados
        prestamos_activos = self.get_queryset().filter(estado='activo')
        serializer = self.get_serializer(prestamos_activos, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, EsEmpleado])
    def pagados(self, request):
        # Solo empleados
        prestamos_pagados = self.get_queryset().filter(estado='pagado')
        serializer = self.get_serializer(prestamos_pagados, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, EsEmpleado])
    def anular(self, request, pk=None):
        # Solo empleados
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