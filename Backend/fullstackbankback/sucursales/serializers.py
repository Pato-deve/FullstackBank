from rest_framework import serializers
from .models import Sucursal
from usuarios.models import Usuario

class SucursalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sucursal
        fields = ['id','nombre', 'direccion','telefono']

class EmpleadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'sucursal']