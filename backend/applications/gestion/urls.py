from rest_framework.routers import DefaultRouter

from .views import PeonViewSet, TarjaViewSet,HoraExtraViewSet


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



urlpatterns = router.urls