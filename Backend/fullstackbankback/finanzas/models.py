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
    numero_tarjeta = models.CharField(max_length=16)
    tipo_tarjeta = models.CharField(max_length=30)
    cvv = models.CharField(max_length=3)
    expiracion = models.DateField()

    def __str__(self):
        return f"{self.numero_tarjeta} - {self.tipo_tarjeta}"


class Transferencia(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='transferencias')
    monto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    descripcion = models.TextField()

    def __str__(self):
        return f"Transferencia de {self.monto} - {self.descripcion}"

class Prestamo(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='prestamos')
    monto_prestado = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    interes = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pago_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cuota_mensual = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Préstamo de {self.monto_prestado} con un interes de {self.interes}%"

class Pago(models.Model):
    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='pagos')
    servicio = models.CharField(max_length=30)
    monto = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estado = models.CharField(max_length=10)
    fecha_pago = models.DateField()

    def __str__(self):
        return f"Pago de {self.monto} al servicio {self.servicio}"