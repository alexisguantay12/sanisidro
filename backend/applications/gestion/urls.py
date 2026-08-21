from rest_framework.routers import DefaultRouter

from .views import PeonViewSet, TarjaViewSet,HoraExtraViewSet,ProveedorViewSet,ConfiguracionTractorViewSet
from .views import TractorSergioViewSet,TractorTerceroViewSet,ConsumoInsumoViewSet,InsumoViewSet, ValorJornalViewSet

from django.urls import path

from .views import (
    CambiarPasswordView,
)
router = DefaultRouter()

router.register(
    r"peones",
    PeonViewSet,
    basename="peon"
)

router.register(
    "tarjas",
    TarjaViewSet,
    basename="tarja",
)

router.register(
    "horas-extra",
    HoraExtraViewSet,
    basename="hora-extra",
)

router.register(
    r"proveedores",
    ProveedorViewSet,
    basename="proveedores",
)

router.register(
    r"tractor/configuracion",
    ConfiguracionTractorViewSet,
    basename="tractor-configuracion",
)

router.register(
    r"tractor/sergio",
    TractorSergioViewSet,
    basename="tractor-sergio",
)

router.register(
    r"tractor/terceros",
    TractorTerceroViewSet,
    basename="tractor-terceros",
)

router.register(
    r"insumos",
    InsumoViewSet,
    basename="insumo",
)

router.register(
    r"consumos-insumos",
    ConsumoInsumoViewSet,
    basename="consumo-insumo",
)

router.register(
    r"valor-jornal",
    ValorJornalViewSet,
    basename="valor-jornal",
)



urlpatterns = [
    path(
        "cambiar-password/",
        CambiarPasswordView.as_view(),
        name="cambiar-password",
    ),
]

urlpatterns += router.urls

urlpatterns = router.urls