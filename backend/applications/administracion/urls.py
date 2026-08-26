from rest_framework.routers import DefaultRouter

from applications.administracion.views import (
    LiquidacionAlmacigoViewSet,
    LiquidacionPersonalViewSet,
    LiquidacionTractorViewSet,
    RendicionVentaViewSet,
    ValorAdministradorViewSet
) 
from django.urls import path
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

router.register(
    r"valores-administrador",
    ValorAdministradorViewSet,
    basename="valores-administrador",
)
 

urlpatterns = router.urls