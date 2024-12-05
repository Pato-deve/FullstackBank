from django.db import transaction
from .models import Cuenta, Tarjeta, Transferencia, Prestamo,Servicios
from rest_framework import serializers

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = ['id', 'numero_cuenta', 'tipo_cuenta', 'balance_pesos', 'balance_dolares']
        read_only_fields = ['id', 'numero_cuenta']  # 'numero_cuenta' es de solo lectura, generado automáticamente

        

class TarjetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tarjeta
        fields = ['id', 'cuenta', 'numero_tarjeta', 'tipo_tarjeta', 'cvv', 'expiracion', 'proveedor']
        read_only_fields = ['id', 'numero_tarjeta', 'cvv', 'expiracion']

    def validate(self, data):
        if 'numero_tarjeta' in data and Tarjeta.objects.filter(numero_tarjeta=data['numero_tarjeta']).exists():
            raise serializers.ValidationError("El número de tarjeta ya existe en el sistema.")
        
        if 'proveedor' in data and data['proveedor'] not in dict(Tarjeta.PROVEEDOR_CHOICES):
            raise serializers.ValidationError("El proveedor debe ser 'Visa' o 'MasterCard'.")
        
        if 'tipo_tarjeta' in data and data['tipo_tarjeta'] not in dict(Tarjeta.TIPO_TARJETA_CHOICES):
            raise serializers.ValidationError("El tipo de tarjeta debe ser 'Débito' o 'Crédito'.")

        return data


class TransferenciaSerializer(serializers.ModelSerializer):
    username_receptor = serializers.CharField(read_only=True)  # Campo solo de lectura

    class Meta:
        model = Transferencia
        fields = ['id', 'cuenta_origen', 'cuenta_destino', 'monto', 'descripcion', 'fecha', 'username_emisor', 'username_receptor']
        read_only_fields = ['id', 'fecha', 'username_emisor', 'username_receptor']

    def validate(self, data):
        if data['monto'] <= 0:
            raise serializers.ValidationError('El monto debe ser mayor a 0')

        cuenta_origen = data['cuenta_origen']
        if cuenta_origen.balance_pesos < data['monto']:
            raise serializers.ValidationError('Saldo insuficiente')

        if data['cuenta_origen'] == data['cuenta_destino']:
            raise serializers.ValidationError('La cuenta origen y la cuenta destino no pueden ser la misma.')

        return data

class PrestamoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prestamo
        fields = ['id', 'cuenta', 'monto_prestado', 'interes', 'pago_total', 'cuota_mensual', 'meses_duracion', 'estado']
        read_only_fields = ['id', 'pago_total', 'cuota_mensual', 'estado']

    def validate(self, data):
        user = self.context['request'].user
        cuenta = data.get('cuenta')

        if cuenta and cuenta.usuario != user:
            raise serializers.ValidationError("No puedes crear un préstamo para una cuenta que no te pertenece.")

        if data['monto_prestado'] <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a $0.")

        if data['meses_duracion'] <= 0 or data['meses_duracion'] > 60:
            raise serializers.ValidationError("La duración debe estar entre 1 y 60 meses.")

        return data

    def create(self, validated_data):
        cuenta = validated_data['cuenta']
        monto_prestado = validated_data['monto_prestado']
        interes = validated_data['interes']
        meses = validated_data['meses_duracion']

        pago_total = monto_prestado + (monto_prestado * (interes / 100))
        cuota_mensual = pago_total / meses

        cuenta.balance_pesos += monto_prestado
        cuenta.save()

        return Prestamo.objects.create(
            cuenta=cuenta,
            monto_prestado=monto_prestado,
            interes=interes,
            pago_total=pago_total,
            cuota_mensual=cuota_mensual,
            meses_duracion=meses,
        )


class ServiciosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicios
        fields = ['id', 'cuenta', 'servicio', 'monto', 'estado', 'fecha_pago']
        extra_kwargs = {
            'estado': {'default': 'pendiente'},  # Valor por defecto para el estado
            'fecha_pago': {'read_only': True}    # Hacer que el campo sea solo lectura
        }