from django.contrib.auth.admin import UserAdmin
from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'es_empleado', 'sucursal')
    list_filter = ('es_empleado', 'sucursal')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('telefono', 'direccion', 'es_empleado', 'sucursal')}),
    )