from rest_framework import serializers
from django.contrib.auth import get_user_model

from sucursales.serializers import SucursalSerializer

Usuario = get_user_model()

class RegistroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
        )
        return user

class DetalleUsuarioSerializer(serializers.ModelSerializer):
    sucursal = SucursalSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name','sucursal']


