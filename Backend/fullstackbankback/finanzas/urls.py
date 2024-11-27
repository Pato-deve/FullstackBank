from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CuentaViewSet, TarjetaViewSet, TransferenciaViewSet, PrestamoViewSet, PagoViewSet

router = DefaultRouter()
router.register(r'cuentas', CuentaViewSet, basename='cuentas')
router.register(r'tarjetas', TarjetaViewSet)
router.register(r'transferencias', TransferenciaViewSet, basename='transferencias')
router.register(r'prestamos', PrestamoViewSet, basename='prestamos')
router.register(r'pagos', PagoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]