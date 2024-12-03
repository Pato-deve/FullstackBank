from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Sucursal
from .serializers import SucursalSerializer
from .permissions import EsEmpleado
from usuarios.models import Usuario

class SucursalViewSet(viewsets.ModelViewSet):
    queryset = Sucursal.objects.all()
    serializer_class = SucursalSerializer
    permission_classes = [IsAuthenticated, EsEmpleado]

class EmpleadosDeSucursalView(APIView):
    def get(self, request, pk):
        empleados = Usuario.objects.filter(sucursal_id=pk, es_empleado=True)
        return Response({
            "empleados": [{"id": e.id, "username": e.username} for e in empleados]
        })