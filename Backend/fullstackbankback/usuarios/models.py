from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    telefono = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.CharField(max_length=150, blank=True, null=True)
    es_empleado = models.BooleanField(default=False)
    sucursal = models.ForeignKey(
        'sucursales.Sucursal',
        on_delete=models.CASCADE,
        related_name='empleados',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({'Empleado' if self.es_empleado else 'Cliente'})"