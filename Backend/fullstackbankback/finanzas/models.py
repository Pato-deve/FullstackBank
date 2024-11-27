import datetime
from random import random, randint

from django.db import models
from django.conf import settings

class Cuenta(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cuentas')
    tipo_cuenta = models.CharField(max_length=30)
    balance_pesos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_dolares = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.tipo_cuenta} - {self.usuario.username}"

class Tarjeta(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='tarjetas')
    numero_tarjeta = models.CharField(max_length=16, unique=True)
    tipo_tarjeta = models.CharField(max_length=20,choices=[('debito','Débito'),('credito','Crédito')])
    cvv = models.CharField(max_length=3,editable=False)
    expiracion = models.DateField(editable=False)

    def save(self, *args, **kwargs):
        if not self.numero_tarjeta:
            self.numero_tarjeta = self.generar_numero_tarjeta()
        if not self.cvv:
            self.cvv = str(randint(100,999))
        if not self.expiracion:
            self.expiracion = datetime.date.today() + datetime.timedelta(days = 3*365)
        super().save(*args, **kwargs)

    @staticmethod
    def generar_numero_tarjeta():
        while True:
            numero = ''.join([str(randint(0,9)) for n in range(16)])
            if not Tarjeta.objects.filter(numero_tarjeta=numero).exists():
                return numero

    def __str__(self):
        return f"{self.numero_tarjeta} - {self.tipo_tarjeta}"


class Transferencia(models.Model):
    cuenta_origen = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='transferencias_realizadas')
    cuenta_destino = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='transferencias_recibidas')
    monto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    descripcion = models.TextField(blank=True, null=True)
    fecha = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Transferencia de {self.cuenta_origen} a {self.cuenta_destino} - {self.monto}"

class Prestamo(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='prestamos')
    monto_prestado = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    interes = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pago_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cuota_mensual = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fecha_inicio = models.DateField(default=datetime.date.today)
    meses_duracion = models.PositiveBigIntegerField()
    estado = models.CharField(
        max_length=10,
        choices=[('activo','Activo'),('pagado','Pagado')],
        default='activo'
    )

    def actualizar_estado(self):
        cuotas_restantes = self.pago_total - (self.cuota_mensual * self.meses_duracion)
        if cuotas_restantes < 0:
            self.estado = 'pagado'
            self.save()

    def __str__(self):
        return f"Préstamo de {self.monto_prestado} - {self.estado}"

class Servicios(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='pagos')
    servicio = models.CharField(max_length=30)
    monto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=10)
    fecha_pago = models.DateField()

    def __str__(self):
        return f"Pago de {self.monto} al servicio {self.servicio}"