from rest_framework.routers import DefaultRouter

from .views import PeonViewSet, TarjaViewSet,HoraExtraViewSet,ProveedorViewSet,ConfiguracionTractorViewSet
from .views import TractorSergioViewSet,TractorTerceroViewSet


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


urlpatterns = router.urls