import datetime
from django.db import transaction
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
        read_only_fields = ['id','numero_tarjeta', 'cvv','expiracion']

    def validate(self,data):
        if 'numero_tarjeta' in data and Tarjeta.objects.filter(numero_tarjeta=data['numero_tarjeta']).exists():
            raise serializers.ValidationError("El número de tarjeta ya existe en el sistema.")
        return data

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
        fields = ['id', 'cuenta', 'monto_prestado', 'interes', 'pago_total', 'cuota_mensual','fecha_inicio','meses_duracion','estado']
        read_only_fields = ['id', 'pago_total', 'cuota_mensual', 'fecha_inicio','estado']

        def validate(self, data):
            if data['monto_prestado'] <= 0:
                raise serializers.ValidationError('El préstamo debe ser mayor a $0')
            if data['meses_duracion'] <= 0 or data['meses_duracion'] > 60:
                raise serializers.ValidationError('La duración debe estar entre 1 y 60 meses')
            return data

        def create(self, validated_data):
            cuenta = validated_data['cuenta']
            monto_prestado = validated_data['monto_prestado']
            interes = validated_data['interes']
            meses = validated_data['meses_duracion']

            pago_total = monto_prestado + (monto_prestado * (interes / 100))
            cuota_mensual = pago_total / meses

            with transaction.atomic():
                cuenta.balance_pesos += monto_prestado
                cuenta.save()

                prestamo = Prestamo.objects.create(
                    cuenta=cuenta,
                    monto_prestado=monto_prestado,
                    interes=interes,
                    pago_total=pago_total,
                    cuota_mensual=cuota_mensual,
                    meses_duracion=meses,
                )
            return prestamo

class ServiciosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicios
        fields = ['id', 'cuenta', 'servicio', 'monto', 'estado', 'fecha_pago']