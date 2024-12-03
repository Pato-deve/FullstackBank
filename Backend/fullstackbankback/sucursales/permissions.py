from rest_framework.permissions import BasePermission

class EsEmpleado(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.es_empleado

class EsEmpleadoDeSucursal(BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and request.user.es_empleado and obj == request.user.sucursal