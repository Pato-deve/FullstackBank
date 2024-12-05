from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate
from usuarios.serializers import RegistroSerializer, DetalleUsuarioSerializer
from usuarios.models import Usuario

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
        "direccion": user.direccion
    }
    return Response(data)

@api_view(['PUT'])
def actualizar_direccion_usuario(request):
    """
    Actualiza la dirección de un usuario. El empleado puede cambiar la dirección
    de cualquier usuario, y los usuarios pueden cambiar su propia dirección.
    """
    # Verificamos si el usuario está autenticado
    if not request.user.is_authenticated:
        return Response({"error": "No estás autenticado."}, status=status.HTTP_401_UNAUTHORIZED)

    # Obtenemos el 'username' o 'id' del usuario objetivo y la nueva dirección
    username_or_id = request.data.get('username_or_id', None)
    nueva_direccion = request.data.get('direccion', None)

    if not username_or_id or not nueva_direccion:
        return Response({"error": "El 'username_or_id' y la nueva dirección son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

    # Si el usuario es un empleado, puede cambiar la dirección de cualquier usuario
    if request.user.es_empleado:
        # Comprobamos si el 'username_or_id' es un ID numérico o un 'username'
        try:
            if username_or_id.isdigit():  # Si es un ID numérico, lo buscamos por ID
                usuario = Usuario.objects.get(id=username_or_id)
            else:  # Si no es numérico, lo buscamos por 'username'
                usuario = Usuario.objects.get(username=username_or_id)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
    # Si no es empleado, debe cambiar su propia dirección
    elif str(request.user.id) == str(username_or_id) or request.user.username == username_or_id:
        usuario = request.user  # El usuario cambia su propia dirección
    else:
        return Response({"error": "No tienes permisos para hacer esta acción."}, status=status.HTTP_403_FORBIDDEN)

    # Actualizamos la dirección del usuario
    usuario.direccion = nueva_direccion
    usuario.save()

    return Response({"mensaje": "Dirección actualizada con éxito."}, status=status.HTTP_200_OK)