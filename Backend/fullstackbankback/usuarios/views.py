from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from usuarios.serializers import RegistroSerializer
from usuarios.serializers import DetalleUsuarioSerializer


class RegistroUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'mensaje':'Usuario registrado exitosamente'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        return Response({'mensaje':'Solo para usuarios autenticados'})

class DetalleUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        serializer = DetalleUsuarioSerializer(usuario)
        return Response(serializer.data)