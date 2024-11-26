from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CuentaViewSet, TarjetaViewSet, TransferenciaViewSet, PrestamoViewSet, PagoViewSet

router = DefaultRouter()
router.register(r'cuentas', CuentaViewSet, basename='cuentas')
router.register(r'tarjetas', TarjetaViewSet)
router.register(r'transferencias', TransferenciaViewSet)
router.register(r'prestamos', PrestamoViewSet)
router.register(r'pagos', PagoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
