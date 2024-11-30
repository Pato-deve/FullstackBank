# urls.py
from django.urls import path
from .views import LoginView, RegistroUsuarioView, DetalleUsuarioView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('detalle/', DetalleUsuarioView.as_view(), name='detalle_usuario'),
]
