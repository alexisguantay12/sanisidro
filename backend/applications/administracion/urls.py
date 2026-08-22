from rest_framework.routers import DefaultRouter

from applications.administracion.views import (
    LiquidacionAlmacigoViewSet,
    LiquidacionPersonalViewSet,
    LiquidacionTractorViewSet,
    RendicionVentaViewSet,
)


router = DefaultRouter()

router.register(
    r"personal",
    LiquidacionPersonalViewSet,
    basename="administracion-personal",
)

router.register(
    r"tractor",
    LiquidacionTractorViewSet,
    basename="administracion-tractor",
)

router.register(
    r"almacigos",
    LiquidacionAlmacigoViewSet,
    basename="administracion-almacigos",
)

router.register(
    r"rendiciones",
    RendicionVentaViewSet,
    basename="administracion-rendiciones",
)


urlpatterns = router.urls