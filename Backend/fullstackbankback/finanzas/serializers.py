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
        fields = ['id', 'cuenta_origen','cuenta_destino', 'monto', 'descripcion','fecha']
        read_only_fields = ['id','fecha']

    def validate(self, data):
        if data['monto'] <= 0:
            raise serializers.ValidationError('El monto debe ser mayor a 0')

        cuenta_origen = data['cuenta_origen']
        if cuenta_origen.balance_pesos < data['monto']:
            raise serializers.ValidationError('Saldo insuficiente')

        if data['cuenta_origen'] == data['cuenta_destino']:
            raise serializers.ValidationError('La cuenta origen y la cuenta destino no pueden ser la misma.')

        return data

    def create(self, validated_data):
        cuenta_origen = validated_data['cuenta_origen']
        cuenta_destino = validated_data['cuenta_destino']
        monto = validated_data['monto']

        cuenta_origen.balance_pesos -= monto
        cuenta_origen.save()

        cuenta_destino.balance_pesos += monto
        cuenta_destino.save()

        return super().create(validated_data)

class PrestamoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prestamo
        fields = ['id', 'cuenta', 'monto_prestado', 'interes', 'pago_total', 'cuota_mensual']

class ServiciosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicios
        fields = ['id', 'cuenta', 'servicio', 'monto', 'estado', 'fecha_pago']