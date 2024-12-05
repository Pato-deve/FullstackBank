import datetime
from random import randint
import random
from django.db import models
from django.conf import settings

class Cuenta(models.Model):
    TIPO_CUENTA_CHOICES = [
        ('ahorro', 'Ahorro'),
        ('corriente', 'Corriente'),
    ]
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cuentas')
    tipo_cuenta = models.CharField(max_length=30, choices=TIPO_CUENTA_CHOICES)
    balance_pesos = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_dolares = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    numero_cuenta = models.CharField(max_length=10, unique=True, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.numero_cuenta:
            self.numero_cuenta = self.generar_numero_cuenta()
        super().save(*args, **kwargs)

    def generar_numero_cuenta(self):
        return f"{random.randint(100, 999)}-{random.randint(10000, 99999)}"
    
    def __str__(self):
        return f"{self.tipo_cuenta} - {self.usuario.username} - {self.numero_cuenta}"


class Tarjeta(models.Model):
    TIPO_TARJETA_CHOICES = [
        ('debito', 'Débito'),
        ('credito', 'Crédito'),
    ]

    PROVEEDOR_CHOICES = [
        ('visa', 'Visa'),
        ('mastercard', 'MasterCard'),
    ]

    cuenta = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='tarjetas')
    numero_tarjeta = models.CharField(max_length=16, unique=True)
    tipo_tarjeta = models.CharField(max_length=20, choices=TIPO_TARJETA_CHOICES)
    cvv = models.CharField(max_length=3, editable=False)
    expiracion = models.DateField(editable=False)
    proveedor = models.CharField(
        max_length=50, 
        choices=PROVEEDOR_CHOICES, 
        null=True, 
        blank=True
    )

    def save(self, *args, **kwargs):
        if not self.numero_tarjeta:
            self.numero_tarjeta = self.generar_numero_tarjeta()
        if not self.cvv:
            self.cvv = str(randint(100, 999))
        if not self.expiracion:
            self.expiracion = datetime.date.today() + datetime.timedelta(days=3 * 365)
        super().save(*args, **kwargs)

    @staticmethod
    def generar_numero_tarjeta():
        while True:
            numero = ''.join([str(randint(0, 9)) for _ in range(16)])
            if not Tarjeta.objects.filter(numero_tarjeta=numero).exists():
                return numero

    def __str__(self):
        return f"{self.numero_tarjeta} - {self.tipo_tarjeta}"


class Transferencia(models.Model):
    cuenta_origen = models.ForeignKey(Cuenta, related_name="transferencias_origen", on_delete=models.CASCADE)
    cuenta_destino = models.ForeignKey(Cuenta, related_name="transferencias_destino", on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    username_emisor = models.CharField(max_length=255)
    username_receptor = models.CharField(max_length=255)

    def __str__(self):
        return f"Transferencia de {self.username_emisor} a {self.username_receptor} - Monto: {self.monto}"

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
        choices=[('activo','Activo'),('pagado','Pagado'),('anulado','Anulado')],
        default='activo'
    )

    def calcular_cuotas(self):
        self.pago_total = self.monto_prestado + (self.monto_prestado * (self.interes / 100))
        self.cuota_mensual = self.pago_total /self.meses_duracion

    def anular(self):
        if self.estado != 'activo':
            raise ValueError("Solo se pueden anular préstamos activos.")
        self.cuenta.balance_pesos -= self.monto_prestado
        self.estado = 'anulado'
        self.save()
        self.cuenta.save()

    def save(self, *args, **kwargs):
        if not self.pk:
            self .calcular_cuotas()
            self.cuenta.balance_pesos += self.monto_prestado
            self.cuenta.save()
        super().save(*args, **kwargs)

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
    estado = models.CharField(max_length=10, default='pendiente')  # Valor por defecto
    fecha_pago = models.DateTimeField(auto_now_add=True)  # Usar DateTimeField para incluir la hora

    def __str__(self):
        return f"Pago de {self.monto} al servicio {self.servicio}"