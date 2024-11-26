from rest_framework import serializers
from .models import Cuenta, Tarjeta, Transferencia, Prestamo,Pago

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = ['id', 'usuario', 'tipo_cuenta', 'balance_pesos', 'balance_dolares']

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

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = ['id', 'cuenta', 'servicio', 'monto', 'estado', 'fecha_pago']