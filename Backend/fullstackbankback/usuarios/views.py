# usuarios/views.py
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from usuarios.serializers import RegistroSerializer, DetalleUsuarioSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'es_empleado': user.es_empleado,
            }, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            # Generar tokens para el usuario recién registrado
            refresh = RefreshToken.for_user(user)
            return Response({
                'mensaje': 'Usuario registrado exitosamente',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class DetalleUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        serializer = DetalleUsuarioSerializer(usuario)
        return Response(serializer.data)

@api_view(['GET'])
def obtener_usuario(request):
    user = request.user
    if not user.is_authenticated:
        return Response({"error": "Usuario no autenticado."}, status=401)

    data = {
        "id": user.id,
        "nombre": user.first_name,
        "apellido": user.last_name,
        "email": user.email,
        "es_empleado": user.es_empleado,
    }
    return Response(data)