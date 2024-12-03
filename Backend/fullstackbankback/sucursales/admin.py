from django.contrib import admin
from .models import Sucursal

@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'direccion', 'telefono')
    search_fields = ('nombre', 'direccion')
    list_filter = ('direccion',)
