from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Peon, Tarja
from .serializers import TarjaSerializer,PeonSerializer

class PeonViewSet(viewsets.ModelViewSet):
    serializer_class = PeonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Peon.objects.filter(
            is_deleted=False
        ).order_by("nombre")

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user
        )




class TarjaViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        TarjaSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):
        queryset = (
            Tarja.objects
            .filter(
                is_deleted=False
            )
            .select_related(
                "peon",
                "destinatario",
            )
        )

        peon = (
            self.request
            .query_params
            .get("peon")
        )

        year = (
            self.request
            .query_params
            .get("year")
        )

        month = (
            self.request
            .query_params
            .get("month")
        )

        if peon:
            queryset = (
                queryset.filter(
                    peon_id=peon
                )
            )

        if year:
            queryset = (
                queryset.filter(
                    fecha__year=year
                )
            )

        if month:
            queryset = (
                queryset.filter(
                    fecha__month=month
                )
            )

        return queryset.order_by(
            "fecha"
        )


    def perform_create(
        self,
        serializer,
    ):
        serializer.save(
            user_made=
                self.request.user
        )


    def perform_update(
        self,
        serializer,
    ):
        serializer.save(
            user_updated=
                self.request.user
        )


    def perform_destroy(
        self,
        instance,
    ):
        instance.delete(
            user=self.request.user
        )


    @action(
        detail=False,
        methods=["post"],
        url_path="carga-mensual",
    )
    def carga_mensual(
        self,
        request,
    ):
        peon_id = request.data.get(
            "peon"
        )

        registros = request.data.get(
            "registros",
            [],
        )

        if not peon_id:
            return Response(
                {
                    "detail": (
                        "Debe seleccionar "
                        "un peón."
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        if not isinstance(
            registros,
            list,
        ):
            return Response(
                {
                    "detail": (
                        "Los registros "
                        "deben ser una lista."
                    )
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        try:
            peon = Peon.objects.get(
                id=peon_id,
                is_deleted=False,
                activo=True,
            )

        except Peon.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "El peón seleccionado "
                        "no existe o no está "
                        "activo."
                    )
                },
                status=(
                    status
                    .HTTP_404_NOT_FOUND
                ),
            )

        creados = 0
        actualizados = 0
        eliminados = 0

        with transaction.atomic():

            for registro in registros:

                fecha = registro.get(
                    "fecha"
                )

                fraccion = registro.get(
                    "fraccion"
                )

                tarea = registro.get(
                    "tarea",
                    "",
                )

                observacion = registro.get(
                    "observacion",
                    "",
                )

                destino = registro.get(
                    "destino",
                    Tarja.Destino.SAN_ISIDRO,
                )

                destinatario_id = (
                    registro.get(
                        "destinatario"
                    )
                )


                # ========================================
                # FECHA
                # ========================================

                if not fecha:
                    return Response(
                        {
                            "detail": (
                                "Todos los registros "
                                "deben tener fecha."
                            )
                        },
                        status=(
                            status
                            .HTTP_400_BAD_REQUEST
                        ),
                    )


                # ========================================
                # BUSCAR TARJA
                # ========================================

                tarja = (
                    Tarja._base_manager
                    .filter(
                        peon=peon,
                        fecha=fecha,
                    )
                    .order_by("-id")
                    .first()
                )


                # ========================================
                # ELIMINAR DÍA
                # ========================================

                if fraccion is None:

                    if (
                        tarja
                        and not tarja.is_deleted
                    ):
                        tarja.delete(
                            user=request.user
                        )

                        eliminados += 1

                    continue


                # ========================================
                # VALIDAR FRACCIÓN
                # ========================================

                if fraccion not in {
                    Tarja.Fraccion.COMPLETO,
                    Tarja.Fraccion.MEDIO,
                }:
                    return Response(
                        {
                            "detail": (
                                f"La fracción "
                                f"'{fraccion}' "
                                f"no es válida "
                                f"para {fecha}."
                            )
                        },
                        status=(
                            status
                            .HTTP_400_BAD_REQUEST
                        ),
                    )


                # ========================================
                # VALIDAR DESTINO
                # ========================================

                if destino not in {
                    Tarja.Destino.SAN_ISIDRO,
                    Tarja.Destino.EXTERNO,
                }:
                    return Response(
                        {
                            "detail": (
                                f"El destino "
                                f"'{destino}' "
                                f"no es válido "
                                f"para {fecha}."
                            )
                        },
                        status=(
                            status
                            .HTTP_400_BAD_REQUEST
                        ),
                    )


                # ========================================
                # DESTINATARIO
                # ========================================

                destinatario = None


                if (
                    destino
                    == Tarja.Destino.EXTERNO
                ):

                    if not destinatario_id:
                        return Response(
                            {
                                "detail": (
                                    "Debe seleccionar "
                                    "un destinatario "
                                    f"para {fecha}."
                                )
                            },
                            status=(
                                status
                                .HTTP_400_BAD_REQUEST
                            ),
                        )

                    try:
                        destinatario = (
                            Peon.objects.get(
                                id=destinatario_id,
                                is_deleted=False,
                                activo=True,
                            )
                        )

                    except Peon.DoesNotExist:
                        return Response(
                            {
                                "detail": (
                                    "El destinatario "
                                    "seleccionado "
                                    "no existe o "
                                    "no está activo."
                                )
                            },
                            status=(
                                status
                                .HTTP_400_BAD_REQUEST
                            ),
                        )


                    # No puede trabajar
                    # para sí mismo.

                    if (
                        destinatario.id
                        == peon.id
                    ):
                        return Response(
                            {
                                "detail": (
                                    f"{peon.nombre} "
                                    "no puede figurar "
                                    "como destinatario "
                                    "de su propia tarja."
                                )
                            },
                            status=(
                                status
                                .HTTP_400_BAD_REQUEST
                            ),
                        )


                # Si es San Isidro,
                # SIEMPRE dejamos null.

                else:
                    destinatario = None


                # ========================================
                # ACTUALIZAR
                # ========================================

                if tarja:

                    tarja.fraccion = (
                        fraccion
                    )

                    tarja.tarea = (
                        tarea
                    )

                    tarja.observacion = (
                        observacion
                    )

                    tarja.destino = (
                        destino
                    )

                    tarja.destinatario = (
                        destinatario
                    )


                    # Restauramos en caso
                    # de que estuviera eliminada.

                    tarja.is_deleted = False

                    tarja.deleted_at = None

                    tarja.user_deleted = None

                    tarja.user_updated = (
                        request.user
                    )

                    tarja.save()

                    actualizados += 1


                # ========================================
                # CREAR
                # ========================================

                else:

                    Tarja.objects.create(
                        peon=peon,
                        fecha=fecha,

                        fraccion=fraccion,

                        tarea=tarea,

                        destino=destino,

                        destinatario=(
                            destinatario
                        ),

                        observacion=(
                            observacion
                        ),

                        user_made=(
                            request.user
                        ),
                    )

                    creados += 1


        return Response(
            {
                "detail": (
                    "Tarjas guardadas "
                    "correctamente."
                ),
                "creados": creados,
                "actualizados": actualizados,
                "eliminados": eliminados,
            },
            status=(
                status.HTTP_200_OK
            ),
        )


from decimal import Decimal

from rest_framework import serializers, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import HoraExtra, ValorJornal
from .serializers import HoraExtraSerializer



class HoraExtraViewSet(viewsets.ModelViewSet):
    serializer_class = HoraExtraSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            HoraExtra.objects
            .filter(is_deleted=False)
            .select_related("peon")
            .order_by("-fecha", "-id")
        )

    def perform_create(self, serializer):

        fecha = serializer.validated_data["fecha"]

        valor_jornal = (
            ValorJornal.objects
            .filter(
                is_deleted=False,
                activo=True,
                vigente_desde__lte=fecha,
            )
            .order_by("-vigente_desde")
            .first()
        )

        if not valor_jornal:
            raise serializers.ValidationError({
                "detail": (
                    "No existe un valor de jornal "
                    "vigente para esa fecha."
                )
            })

        cantidad_horas = serializer.validated_data[
            "cantidad_horas"
        ]

        valor_hora = (
            valor_jornal.valor / Decimal("8")
        )

        total = (
            valor_hora *
            Decimal(cantidad_horas)
        )

        serializer.save(
            estado=HoraExtra.Estado.PENDIENTE,
            valor_jornal_aplicado=valor_jornal.valor,
            valor_hora=valor_hora,
            total=total,
            user_made=self.request.user,
        )

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.estado != HoraExtra.Estado.PENDIENTE:
            raise serializers.ValidationError({
                "detail": (
                    "No se puede modificar una hora extra liquidada."
                )
            })

        campos_permitidos = {
            "cantidad_horas"
        }

        campos_recibidos = set(request.data.keys())

        if not campos_recibidos.issubset(campos_permitidos):
            raise serializers.ValidationError({
                "detail": (
                    "Solo se puede modificar la cantidad de horas."
                )
            })

        return super().update(
            request,
            *args,
            **kwargs
        )

    def perform_update(self, serializer):

        instance = self.get_object()

        cantidad_horas = serializer.validated_data.get(
            "cantidad_horas",
            instance.cantidad_horas,
        )

        total = (
            instance.valor_hora *
            Decimal(cantidad_horas)
        )

        serializer.save(
            total=total,
            user_updated=self.request.user,
        )

    def perform_destroy(self, instance):

        if instance.estado != HoraExtra.Estado.PENDIENTE:
            raise serializers.ValidationError({
                "detail": (
                    "No se puede eliminar una hora extra liquidada."
                )
            })

        instance.delete(
            user=self.request.user
        )










from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import Coalesce

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    ConfiguracionTractor,
    Proveedor,
    TractorSergio,
    TractorTercero,
)

from .serializers import (
    ConfiguracionTractorSerializer,
    ProveedorSerializer,
    TractorSergioSerializer,
    TractorTerceroSerializer,
)


# ============================================================
# PROVEEDORES
# ============================================================

class ProveedorViewSet(viewsets.ModelViewSet):
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Proveedor.objects
            .filter(is_deleted=False)
            .order_by("nombre")
        )

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user
        )

# ============================================================
# CONFIGURACION TRACTOR
# ============================================================

class ConfiguracionTractorViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        ConfiguracionTractorSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):
        return (
            ConfiguracionTractor.objects
            .filter(is_deleted=False)
            .order_by("-id")
        )

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user
        )

    @action(
        detail=False,
        methods=[
            "get",
            "patch",
        ],
        url_path="actual",
    )
    def actual(self, request):
        configuracion = (
            self.get_queryset()
            .first()
        )

        if request.method == "GET":

            if not configuracion:
                return Response(
                    {
                        "detail": (
                            "No hay configuración "
                            "del tractor."
                        )
                    },
                    status=
                        status.HTTP_404_NOT_FOUND,
                )

            serializer = (
                self.get_serializer(
                    configuracion
                )
            )

            return Response(
                serializer.data
            )

        # PATCH

        if not configuracion:
            serializer = (
                self.get_serializer(
                    data=request.data
                )
            )

            serializer.is_valid(
                raise_exception=True
            )

            serializer.save(
                user_made=
                    request.user
            )

            return Response(
                serializer.data,
                status=
                    status.HTTP_201_CREATED,
            )

        serializer = (
            self.get_serializer(
                configuracion,
                data=request.data,
                partial=True,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            user_updated=
                request.user
        )

        return Response(
            serializer.data
        )

    
# ============================================================
# TRACTOR SERGIO
# ============================================================


class TractorSergioViewSet(
    viewsets.ModelViewSet
):

    serializer_class = TractorSergioSerializer

    def get_queryset(self):

        queryset = (
            TractorSergio.objects
            .filter(
                is_deleted=False,
            )
            .order_by(
                "-fecha",
                "-id",
            )
        )

        estado = self.request.query_params.get(
            "estado"
        )

        if estado:
            queryset = queryset.filter(
                estado=estado
            )

        fecha_desde = (
            self.request.query_params.get(
                "fecha_desde"
            )
        )

        fecha_hasta = (
            self.request.query_params.get(
                "fecha_hasta"
            )
        )

        if fecha_desde:
            queryset = queryset.filter(
                fecha__gte=fecha_desde
            )

        if fecha_hasta:
            queryset = queryset.filter(
                fecha__lte=fecha_hasta
            )

        return queryset

    # --------------------------------------------------------
    # ELIMINAR
    # --------------------------------------------------------

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):

        instance = self.get_object()

        if (
            instance.estado
            != TractorSergio.ESTADO_PENDIENTE
        ):
            return Response(
                {
                    "detail": (
                        "No se puede eliminar un "
                        "registro que ya fue pagado."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.delete(
            user=request.user
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

    # --------------------------------------------------------
    # PAGAR
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="pagar",
    )
    def pagar(
        self,
        request,
        pk=None,
    ):

        instance = self.get_object()

        if (
            instance.estado
            == TractorSergio.ESTADO_PAGADA
        ):
            return Response(
                {
                    "detail": (
                        "El registro ya se encuentra pagado."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.estado = (
            TractorSergio.ESTADO_PAGADA
        )

        instance.user_updated = request.user

        instance.save(
            update_fields=[
                "estado",
                "user_updated",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(
            instance
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # RESUMEN
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="resumen",
    )
    def resumen(
        self,
        request,
    ):

        queryset = self.get_queryset()

        pendientes = queryset.filter(
            estado=TractorSergio.ESTADO_PENDIENTE
        )

        cantidad_pendientes = (
            pendientes.count()
        )

        horas_pendientes = (
            pendientes.aggregate(
                total=Coalesce(
                    Sum("cantidad_horas"),
                    Decimal("0.00"),
                )
            )["total"]
        )

        importe_pendiente = (
            pendientes.aggregate(
                total=Coalesce(
                    Sum("importe"),
                    Decimal("0.00"),
                )
            )["total"]
        )

        return Response(
            {
                "cantidad_pendientes": (
                    cantidad_pendientes
                ),
                "horas_pendientes": (
                    horas_pendientes
                ),
                "importe_pendiente": (
                    importe_pendiente
                ),
            }
        )


# ============================================================
# TRACTOR TERCEROS
# ============================================================


class TractorTerceroViewSet(
    viewsets.ModelViewSet
):

    serializer_class = (
        TractorTerceroSerializer
    )

    def get_queryset(self):

        queryset = (
            TractorTercero.objects
            .filter(
                is_deleted=False,
            )
            .select_related(
                "proveedor"
            )
            .order_by(
                "-fecha",
                "-id",
            )
        )

        estado = self.request.query_params.get(
            "estado"
        )

        proveedor = (
            self.request.query_params.get(
                "proveedor"
            )
        )

        fecha_desde = (
            self.request.query_params.get(
                "fecha_desde"
            )
        )

        fecha_hasta = (
            self.request.query_params.get(
                "fecha_hasta"
            )
        )

        if estado:
            queryset = queryset.filter(
                estado=estado
            )

        if proveedor:
            queryset = queryset.filter(
                proveedor_id=proveedor
            )

        if fecha_desde:
            queryset = queryset.filter(
                fecha__gte=fecha_desde
            )

        if fecha_hasta:
            queryset = queryset.filter(
                fecha__lte=fecha_hasta
            )

        return queryset

    # --------------------------------------------------------
    # ELIMINAR
    # --------------------------------------------------------

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):

        instance = self.get_object()

        if (
            instance.estado
            != TractorTercero.ESTADO_PENDIENTE
        ):
            return Response(
                {
                    "detail": (
                        "No se puede eliminar un "
                        "registro que ya fue pagado."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.delete(
            user=request.user
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

    # --------------------------------------------------------
    # PAGAR
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="pagar",
    )
    def pagar(
        self,
        request,
        pk=None,
    ):

        instance = self.get_object()

        if (
            instance.estado
            == TractorTercero.ESTADO_PAGADA
        ):
            return Response(
                {
                    "detail": (
                        "El registro ya se encuentra pagado."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.estado = (
            TractorTercero.ESTADO_PAGADA
        )

        instance.user_updated = request.user

        instance.save(
            update_fields=[
                "estado",
                "user_updated",
                "updated_at",
            ]
        )

        serializer = self.get_serializer(
            instance
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # --------------------------------------------------------
    # RESUMEN
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="resumen",
    )
    def resumen(
        self,
        request,
    ):

        queryset = self.get_queryset()

        pendientes = queryset.filter(
            estado=TractorTercero.ESTADO_PENDIENTE
        )

        cantidad_pendientes = (
            pendientes.count()
        )

        horas_pendientes = (
            pendientes.aggregate(
                total=Coalesce(
                    Sum("cantidad_horas"),
                    Decimal("0.00"),
                )
            )["total"]
        )

        importe_pendiente = (
            pendientes.aggregate(
                total=Coalesce(
                    Sum("importe"),
                    Decimal("0.00"),
                )
            )["total"]
        )

        return Response(
            {
                "cantidad_pendientes": (
                    cantidad_pendientes
                ),
                "horas_pendientes": (
                    horas_pendientes
                ),
                "importe_pendiente": (
                    importe_pendiente
                ),
            }
        )


from rest_framework import viewsets

from .models import Insumo, ConsumoInsumo
from .serializers import (
    InsumoSerializer,
    ConsumoInsumoSerializer,
    ValorJornalSerializer
)

class InsumoViewSet(viewsets.ModelViewSet):
    serializer_class = InsumoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Insumo.objects
            .filter(is_deleted=False)
            .order_by("nombre")
        )

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user
        )

class ConsumoInsumoViewSet(viewsets.ModelViewSet):
    serializer_class = ConsumoInsumoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ConsumoInsumo.objects
            .filter(is_deleted=False)
            .select_related("insumo")
            .order_by(
                "-fecha_aplicacion",
                "-id",
            )
        )

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user
        )


class ValorJornalViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        ValorJornalSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):
        return (
            ValorJornal.objects
            .filter(is_deleted=False)
            .order_by(
                "-vigente_desde",
                "-id",
            )
        )

    @transaction.atomic
    def perform_create(
        self,
        serializer,
    ):
        ValorJornal.objects.filter(
            is_deleted=False,
            activo=True,
        ).update(
            activo=False
        )

        serializer.save(
            activo=True,
            user_made=
                self.request.user,
        )

    def perform_update(
        self,
        serializer,
    ):
        serializer.save(
            user_updated=
                self.request.user
        )

    def perform_destroy(
        self,
        instance,
    ):
        instance.delete(
            user=self.request.user
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="actual",
    )
    def actual(
        self,
        request,
    ):
        valor = (
            ValorJornal.objects
            .filter(
                is_deleted=False,
                activo=True,
            )
            .order_by(
                "-vigente_desde",
                "-id",
            )
            .first()
        )

        if not valor:
            return Response(
                {
                    "detail": (
                        "No hay un valor "
                        "de jornal vigente."
                    )
                },
                status=
                    status.HTTP_404_NOT_FOUND,
            )

        serializer = (
            self.get_serializer(
                valor
            )
        )

        return Response(
            serializer.data
        )





from rest_framework import (
    status,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import (
    Response,
)

from rest_framework.views import (
    APIView,
)

from .serializers import (
    CambiarPasswordSerializer,
)


class CambiarPasswordView(
    APIView
):
    permission_classes = [
        IsAuthenticated
    ]


    def post(
        self,
        request,
    ):
        serializer = (
            CambiarPasswordSerializer(
                data=request.data,
                context={
                    "request":
                        request,
                },
            )
        )

        serializer.is_valid(
            raise_exception=True
        )


        user = request.user

        user.set_password(
            serializer
            .validated_data[
                "password_nueva"
            ]
        )

        user.save(
            update_fields=[
                "password"
            ]
        )


        return Response(
            {
                "detail": (
                    "Contraseña actualizada "
                    "correctamente."
                )
            },
            status=
                status.HTTP_200_OK,
        )