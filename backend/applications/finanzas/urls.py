from rest_framework.routers import (
    DefaultRouter,
)

from applications.finanzas.views import (
    CategoriaFinancieraViewSet,
    CuentaFinancieraViewSet,
    GrupoFinancieroViewSet,
    MovimientoFinancieroViewSet,
)


router = DefaultRouter()


router.register(
    r"grupos",
    GrupoFinancieroViewSet,
    basename="finanzas-grupos",
)


router.register(
    r"categorias",
    CategoriaFinancieraViewSet,
    basename="finanzas-categorias",
)


router.register(
    r"cuentas",
    CuentaFinancieraViewSet,
    basename="finanzas-cuentas",
)


router.register(
    r"movimientos",
    MovimientoFinancieroViewSet,
    basename="finanzas-movimientos",
)


urlpatterns = router.urls