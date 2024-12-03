from django.db import models

class Sucursal(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    direccion = models.CharField(max_length=100, unique=True)
    telefono = models.CharField(max_length=20, unique=True, blank=True, null=True)

    def __str__(self):
        return self.nombre

