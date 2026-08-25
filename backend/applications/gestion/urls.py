from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    PeonViewSet,
    TarjaViewSet,
    HoraExtraViewSet,
    ProveedorViewSet,
    ConfiguracionTractorViewSet,
    TractorSergioViewSet,
    TractorTerceroViewSet,
    ConsumoInsumoViewSet,
    InsumoViewSet,
    ValorJornalViewSet,
    JornalCarpidaViewSet,
    AlmacigoViewSet,
    ConfiguracionAlmacigoViewSet,
    CompradorViewSet,
    VentaViewSet,
    PagoVentaViewSet,
    CambiarPasswordView,
    ConfiguracionPaleadaViewSet,
    MeView,
    ResumenOperativoViewSet
)


router = DefaultRouter()

router.register(
    r"peones",
    PeonViewSet,
    basename="peon",
)

router.register(
    r"tarjas",
    TarjaViewSet,
    basename="tarja",
)

router.register(
    r"jornales-carpida",
    JornalCarpidaViewSet,
    basename="jornal-carpida",
)

router.register(
    r"horas-extra",
    HoraExtraViewSet,
    basename="hora-extra",
)

router.register(
    r"proveedores",
    ProveedorViewSet,
    basename="proveedores",
)
router.register(
    r"paleada/configuracion",
    ConfiguracionPaleadaViewSet,
    basename="configuracion-paleada",
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
    r"resumen",
    ResumenOperativoViewSet,
    basename="resumen-operativo",
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

router.register(
    r"almacigos",
    AlmacigoViewSet,
    basename="almacigos",
)

router.register(
    r"almacigos/configuracion",
    ConfiguracionAlmacigoViewSet,
    basename="configuracion-almacigos",
)

router.register(
    r"compradores",
    CompradorViewSet,
    basename="comprador",
)

router.register(
    r"ventas",
    VentaViewSet,
    basename="venta",
)

router.register(
    r"pagos-ventas",
    PagoVentaViewSet,
    basename="pago-venta",
)


urlpatterns = [
    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),

    path(
        "cambiar-password/",
        CambiarPasswordView.as_view(),
        name="cambiar-password",
    ),
]

urlpatterns += router.urls