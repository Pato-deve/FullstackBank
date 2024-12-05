from django.urls import path
from .views import LoginView, RegistroUsuarioView, DetalleUsuarioView, obtener_usuario, actualizar_direccion_usuario

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('detalle/', DetalleUsuarioView.as_view(), name='detalle_usuario'),
    path('usuario/', obtener_usuario, name='obtener_usuario'),
    path('actualizar-direccion/', actualizar_direccion_usuario, name='actualizar_direccion_usuario'),
]
