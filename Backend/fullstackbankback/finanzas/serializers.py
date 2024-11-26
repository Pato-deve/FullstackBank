from rest_framework import serializers
from .models import Cuenta, Tarjeta, Transferencia, Prestamo,Servicios

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = ['id', 'tipo_cuenta', 'balance_pesos', 'balance_dolares']
        read_only_fields = ['id']

class TarjetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarjeta
        fields = ['id', 'cuenta', 'numero_tarjeta', 'tipo_tarjeta', 'cvv', 'expiracion']

class TransferenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transferencia
        fields = ['id', 'cuenta', 'monto', 'descripcion']

class PrestamoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prestamo
        fields = ['id', 'cuenta', 'monto_prestado', 'interes', 'pago_total', 'cuota_mensual']

class ServiciosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicios
        fields = ['id', 'cuenta', 'servicio', 'monto', 'estado', 'fecha_pago']