from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Peon, Tarja, JornalCarpida,ConfiguracionPaleada
from .serializers import ResumenOperativoQuerySerializer,TarjaSerializer,PeonSerializer,JornalCarpidaSerializer,ConfiguracionPaleadaSerializer
from applications.administracion.views import recalcular_horas_extra_pendientes,obtener_valor_jornal
from collections import defaultdict

from rest_framework.views import APIView



class MeView(APIView):
    permission_classes = [
        IsAuthenticated,
    ]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_superuser": user.is_superuser,
            "groups": list(
                user.groups.values_list(
                    "name",
                    flat=True,
                )
            ),
        })




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

from rest_framework.exceptions import ValidationError
class JornalCarpidaViewSet(viewsets.ModelViewSet):

    serializer_class = JornalCarpidaSerializer

    def get_queryset(self):
        return (
            JornalCarpida.objects
            .filter(
                is_deleted=False,
            )
            .order_by("-fecha", "-id")
        )

    def obtener_valor_jornal(self, fecha):
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
            raise ValidationError(
                {
                    "fecha": (
                        "No existe un valor de jornal vigente "
                        "para la fecha seleccionada."
                    )
                }
            )

        return valor_jornal

    def calcular_importe(
        self,
        valor_jornal,
        tipo_jornada,
    ):
        if tipo_jornada == JornalCarpida.TipoJornada.DIA:
            return valor_jornal.valor * Decimal("2")

        if tipo_jornada == JornalCarpida.TipoJornada.MEDIO_DIA:
            return valor_jornal.valor

        raise ValidationError(
            {
                "tipo_jornada": "Tipo de jornada inválido."
            }
        )

    def perform_create(self, serializer):
        fecha = serializer.validated_data["fecha"]
        tipo_jornada = serializer.validated_data[
            "tipo_jornada"
        ]

        valor_jornal = self.obtener_valor_jornal(fecha)

        importe = self.calcular_importe(
            valor_jornal,
            tipo_jornada,
        )

        serializer.save(
            valor_jornal=valor_jornal.valor,
            importe=importe,
            liquidada=False,
            user_made=self.request.user,
            user_updated=self.request.user,
        )

    def perform_update(self, serializer):
        instance = self.get_object()

        if instance.liquidada:
            raise ValidationError(
                "No se puede modificar un jornal de carpida liquidado."
            )

        fecha = serializer.validated_data.get(
            "fecha",
            instance.fecha,
        )

        tipo_jornada = serializer.validated_data.get(
            "tipo_jornada",
            instance.tipo_jornada,
        )

        valor_jornal = obtener_valor_jornal(fecha)

        importe = self.calcular_importe(
            valor_jornal,
            tipo_jornada,
        )

        serializer.save(
            valor_jornal=valor_jornal.valor,
            importe=importe,
            user_updated=self.request.user,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.liquidada:
            raise ValidationError(
                "No se puede eliminar un jornal de carpida liquidado."
            )

        instance.is_deleted = True
        instance.user_deleted = request.user

        instance.save(
            update_fields=[
                "is_deleted",
                "user_deleted",
            ]
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
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

    # ================================================
    # AUXILIAR - TARJA LIQUIDADA
    # ================================================

    def esta_liquidada(
        self,
        tarja,
    ):
        return (
            tarja
            .detalles_liquidacion
            .filter(
                is_deleted=False,
                liquidacion__is_deleted=False,
                liquidacion__estado="ACTIVA",
            )
            .exists()
        )

    # ================================================
    # QUERYSET
    # ================================================

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

    # ================================================
    # CREAR
    # ================================================

    def perform_create(
        self,
        serializer,
    ):
        serializer.save(
            user_made=
                self.request.user
        )

    # ================================================
    # ACTUALIZAR
    # ================================================

    def perform_update(
        self,
        serializer,
    ):
        instance = (
            serializer.instance
        )

        if self.esta_liquidada(
            instance
        ):
            raise serializers.ValidationError(
                {
                    "detail": (
                        "La tarja ya fue liquidada "
                        "y no puede modificarse."
                    )
                }
            )

        serializer.save(
            user_updated=
                self.request.user
        )

    # ================================================
    # ELIMINAR
    # ================================================

    def perform_destroy(
        self,
        instance,
    ):
        if self.esta_liquidada(
            instance
        ):
            raise serializers.ValidationError(
                {
                    "detail": (
                        "La tarja ya fue liquidada "
                        "y no puede eliminarse."
                    )
                }
            )

        instance.delete(
            user=self.request.user
        )

    # ================================================
    # CARGA MENSUAL
    # ================================================

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
                # BLOQUEAR TARJA LIQUIDADA
                # ========================================

                if (
                    tarja
                    and not tarja.is_deleted
                    and self.esta_liquidada(
                        tarja
                    )
                ):
                    return Response(
                        {
                            "detail": (
                                f"La tarja del "
                                f"{fecha} ya fue "
                                "liquidada y no "
                                "puede modificarse "
                                "ni eliminarse."
                            )
                        },
                        status=(
                            status
                            .HTTP_400_BAD_REQUEST
                        ),
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
        print("Estpoy aca")
        valor_jornal = (
            obtener_valor_jornal(
                fecha
            )
        )
        print("Estpoy aca")
        if not valor_jornal:
            raise serializers.ValidationError({
                "detail": (
                    "No existe un valor de jornal "
                    "vigente para esa fecha."
                )
            })
        print("Estpoy aca")
        cantidad_horas = serializer.validated_data[
            "cantidad_horas"
        ]
        valor_hora = (
            (
                valor_jornal.valor
                /
                Decimal("8")
            )
            *
            Decimal("1.25")
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

from datetime import timedelta



class ConfiguracionPaleadaViewSet(
    viewsets.ViewSet
):
    permission_classes = [
        IsAuthenticated,
    ]

    def _get_configuracion(
        self,
        request,
    ):
        configuracion, created = (
            ConfiguracionPaleada.objects
            .get_or_create(
                pk=1,
                defaults={
                    "valor": Decimal(
                        "0.01"
                    ),
                    "user_made":
                        request.user,
                    "user_updated":
                        request.user,
                },
            )
        )

        return configuracion

    @action(
        detail=False,
        methods=[
            "get",
            "patch",
        ],
        url_path="actual",
    )
    def actual(
        self,
        request,
    ):
        configuracion = (
            self._get_configuracion(
                request
            )
        )

        if (
            request.method
            == "GET"
        ):
            serializer = (
                ConfiguracionPaleadaSerializer(
                    configuracion
                )
            )

            return Response(
                serializer.data
            )

        serializer = (
            ConfiguracionPaleadaSerializer(
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
            .filter(
                is_deleted=False,
            )
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
        vigente_desde = (
            serializer.validated_data[
                "vigente_desde"
            ]
        )

        vigente_hasta = (
            serializer.validated_data.get(
                "vigente_hasta"
            )
        )

        # Si el nuevo período queda abierto,
        # cerramos automáticamente el anterior.
        if vigente_hasta is None:

            abiertos = list(
                ValorJornal.objects
                .select_for_update()
                .filter(
                    is_deleted=False,
                    activo=True,
                    vigente_hasta__isnull=True,
                    vigente_desde__lt=
                        vigente_desde,
                )
                .order_by(
                    "-vigente_desde",
                    "-id",
                )
            )

            if len(abiertos) > 1:
                raise serializers.ValidationError({
                    "detail": (
                        "Existen varios valores "
                        "de jornal sin fecha hasta. "
                        "Corregí los períodos antes "
                        "de crear uno nuevo."
                    )
                })

            if abiertos:

                anterior = abiertos[0]

                anterior.vigente_hasta = (
                    vigente_desde
                    -
                    timedelta(
                        days=1
                    )
                )

                anterior.user_updated = (
                    self.request.user
                )

                anterior.save(
                    update_fields=[
                        "vigente_hasta",
                        "user_updated",
                    ]
                )

        serializer.save(
            activo=True,
            user_made=
                self.request.user,
        )
        recalcular_horas_extra_pendientes()
   
    @transaction.atomic
    def perform_update(
        self,
        serializer,
    ):
        try:

            serializer.save(
                user_updated=
                    self.request.user
            ) 
            recalcular_horas_extra_pendientes()

        except serializers.ValidationError:
            raise

        except Exception as exc:

            raise serializers.ValidationError({
                "detail": (
                    f"{type(exc).__name__}: "
                    f"{str(exc)}"
                )
            })

        
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

        hoy = (
            timezone.localdate()
        )

        valor = (
            ValorJornal.objects
            .filter(
                is_deleted=False,
                activo=True,
                vigente_desde__lte=hoy,
            )
            .filter(
                Q(
                    vigente_hasta__isnull=True
                )
                |
                Q(
                    vigente_hasta__gte=hoy
                )
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
                        "de jornal vigente "
                        "para la fecha actual."
                    )
                },
                status=
                    status
                    .HTTP_404_NOT_FOUND,
            )

        serializer = (
            self.get_serializer(
                valor
            )
        )

        return Response(
            serializer.data
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="por-fecha",
    )
    def por_fecha(
        self,
        request,
    ):

        fecha = (
            request.query_params
            .get(
                "fecha"
            )
        )

        if not fecha:

            raise (
                serializers
                .ValidationError({
                    "fecha": (
                        "Debe indicar "
                        "una fecha."
                    )
                })
            )

        from django.utils.dateparse import (
            parse_date,
        )

        fecha_parseada = (
            parse_date(
                fecha
            )
        )

        if not fecha_parseada:

            raise (
                serializers
                .ValidationError({
                    "fecha": (
                        "La fecha no "
                        "es válida."
                    )
                })
            )

        valor = (
            ValorJornal.objects
            .filter(
                is_deleted=False,
                activo=True,
                vigente_desde__lte=
                    fecha_parseada,
            )
            .filter(
                Q(
                    vigente_hasta__isnull=True
                )
                |
                Q(
                    vigente_hasta__gte=
                    fecha_parseada
                )
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
                        "No existe un valor "
                        "de jornal vigente "
                        "para la fecha "
                        f"{fecha_parseada}."
                    )
                },
                status=
                    status
                    .HTTP_404_NOT_FOUND,
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

from decimal import Decimal

from rest_framework import (
    status,
    viewsets,
)

from rest_framework.decorators import action

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import Response

from .models import (
    Almacigo,
    ConfiguracionAlmacigo,
)

from .serializers import (
    AlmacigoSerializer,
    ConfiguracionAlmacigoSerializer,
)
class ConfiguracionAlmacigoViewSet(
    viewsets.ViewSet
):
    permission_classes = [
        IsAuthenticated
    ]

    def _get_configuracion(
        self,
        request,
    ):
        configuracion, created = (
            ConfiguracionAlmacigo.objects.get_or_create(
                pk=1,
                defaults={
                    "valor":
                        Decimal("65000.00"),
                    "user_made":
                        request.user,
                    "user_updated":
                        request.user,
                },
            )
        )

        return configuracion

    @action(
        detail=False,
        methods=[
            "get",
            "patch",
        ],
        url_path="actual",
    )
    def actual(
        self,
        request,
    ):
        configuracion = (
            self._get_configuracion(
                request
            )
        )

        if request.method == "GET":
            serializer = (
                ConfiguracionAlmacigoSerializer(
                    configuracion
                )
            )

            return Response(
                serializer.data
            )

        serializer = (
            ConfiguracionAlmacigoSerializer(
                configuracion,
                data=request.data,
                partial=True,
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(
            user_updated=request.user
        )

        return Response(
            serializer.data
        )


from rest_framework import (
    status,
    viewsets,
)

from rest_framework.permissions import (
    IsAuthenticated,
)

from rest_framework.response import (
    Response,
)

from .models import (
    Almacigo,
)

from .serializers import (
    AlmacigoSerializer,
)


class AlmacigoViewSet(
    viewsets.ModelViewSet
):
    serializer_class = (
        AlmacigoSerializer
    )

    permission_classes = [
        IsAuthenticated,
    ]

    queryset = (
        Almacigo.objects.all()
        .order_by(
            "-fecha",
            "-id",
        )
    )

    def perform_create(
        self,
        serializer,
    ):
        serializer.save(
            user_made=
                self.request.user,
            user_updated=
                self.request.user,
        )

    def perform_update(
        self,
        serializer,
    ):
        serializer.save(
            user_updated=
                self.request.user,
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs,
    ):
        instance = (
            self.get_object()
        )

        if (
            instance.estado
            !=
            Almacigo.ESTADO_PENDIENTE
        ):
            return Response(
                {
                    "detail":
                        "No se puede eliminar "
                        "un registro que ya "
                        "fue procesado."
                },
                status=(
                    status
                    .HTTP_400_BAD_REQUEST
                ),
            )

        if hasattr(
            instance,
            "user_deleted",
        ):
            instance.user_deleted = (
                request.user
            )

            instance.save(
                update_fields=[
                    "user_deleted",
                ]
            )

        instance.delete()

        return Response(
            status=(
                status
                .HTTP_204_NO_CONTENT
            )
        )




from django.db import transaction
from django.db.models import Prefetch

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import (
    Comprador,
    Venta,
    PagoVenta,
)

from .serializers import (
    CompradorSerializer,
    VentaSerializer,
    PagoVentaSerializer,
)


class CompradorViewSet(ModelViewSet):
    serializer_class = CompradorSerializer

    queryset = Comprador.objects.filter(
        is_deleted=False,
    ).order_by(
        "nombre",
    )

    def perform_create(self, serializer):
        serializer.save(
            user_made=self.request.user,
        )

    def perform_update(self, serializer):
        serializer.save(
            user_updated=self.request.user,
        )

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user,
        )


class VentaViewSet(ModelViewSet):
    serializer_class = VentaSerializer

    def get_queryset(self):
        queryset = (
            Venta.objects
            .filter(
                is_deleted=False,
            )
            .select_related(
                "comprador",
            )
            .prefetch_related(
                Prefetch(
                    "pagos",
                    queryset=PagoVenta.objects.filter(
                        is_deleted=False,
                    ).order_by(
                        "-fecha",
                        "-id",
                    ),
                )
            )
            .order_by(
                "-fecha",
                "-id",
            )
        )

        estado = self.request.query_params.get(
            "estado"
        )

        comprador = (
            self.request.query_params.get(
                "comprador"
            )
        )

        if estado:
            queryset = queryset.filter(
                estado=estado.upper(),
            )

        if comprador:
            queryset = queryset.filter(
                comprador_id=comprador,
            )

        return queryset

    def perform_destroy(self, instance):
        instance.delete(
            user=self.request.user,
        )

    @action(
        detail=True,
        methods=["get"],
        url_path="pagos",
    )
    def pagos(self, request, pk=None):
        venta = self.get_object()

        pagos = venta.pagos.filter(
            is_deleted=False,
        ).order_by(
            "-fecha",
            "-id",
        )

        serializer = PagoVentaSerializer(
            pagos,
            many=True,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data
        )


class PagoVentaViewSet(ModelViewSet):
    serializer_class = PagoVentaSerializer

    def get_queryset(self):
        queryset = (
            PagoVenta.objects
            .filter(
                is_deleted=False,
                venta__is_deleted=False,
            )
            .select_related(
                "venta",
                "venta__comprador",
            )
            .order_by(
                "-fecha",
                "-id",
            )
        )

        venta = self.request.query_params.get(
            "venta"
        )

        if venta:
            queryset = queryset.filter(
                venta_id=venta,
            )

        return queryset

    @transaction.atomic
    def perform_destroy(self, instance):
        venta = instance.venta

        instance.delete(
            user=self.request.user,
        )

        venta.actualizar_estado()


# ============================================================
# RESUMEN OPERATIVO
# ============================================================


class ResumenOperativoViewSet(
    viewsets.ViewSet
):
    permission_classes = [
        IsAuthenticated,
    ]

    # --------------------------------------------------------
    # HELPERS
    # --------------------------------------------------------

    def _decimal(
        self,
        value,
    ):
        return Decimal(
            str(
                value or 0
            )
        )

    def _decimal_dos(
        self,
        value,
    ):
        return self._decimal(
            value
        ).quantize(
            Decimal("0.01")
        )

    def _nombre_mes(
        self,
        mes,
    ):
        meses = {
            1: "Enero",
            2: "Febrero",
            3: "Marzo",
            4: "Abril",
            5: "Mayo",
            6: "Junio",
            7: "Julio",
            8: "Agosto",
            9: "Septiembre",
            10: "Octubre",
            11: "Noviembre",
            12: "Diciembre",
        }

        return meses.get(
            mes,
            "",
        )

    # --------------------------------------------------------
    # RESUMEN
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="operativo",
    )
    def operativo(
        self,
        request,
    ):

        serializer = (
            ResumenOperativoQuerySerializer(
                data=request.query_params
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = (
            serializer
            .validated_data
        )

        fecha_desde = (
            data[
                "fecha_desde"
            ]
        )

        fecha_hasta = (
            data[
                "fecha_hasta"
            ]
        )

        # ====================================================
        # TARJAS DEL PERIODO
        # ====================================================

        tarjas_periodo = (
            Tarja.objects
            .filter(
                is_deleted=False,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .select_related(
                "peon",
                "destinatario",
            )
            .order_by(
                "fecha",
                "id",
            )
        )

        # ====================================================
        # JORNALES SAN ISIDRO
        # ====================================================

        total_jornales_san_isidro = (
            Decimal("0.00")
        )

        total_paleadas = (
            Decimal("0.00")
        )

        # ====================================================
        # POR TAREA
        # ====================================================

        tareas = defaultdict(
            lambda: {
                "jornales": Decimal(
                    "0.00"
                ),
                "registros": 0,
            }
        )

        # ====================================================
        # JORNALES POR MES
        # ====================================================

        jornales_por_mes = defaultdict(
            lambda: Decimal(
                "0.00"
            )
        )

        # ====================================================
        # DATOS POR PEON
        # ====================================================

        colaboradores = {}

        peones = (
            Peon.objects
            .filter(
                is_deleted=False,
            )
            .order_by(
                "nombre",
            )
        )

        for peon in peones:

            colaboradores[
                peon.id
            ] = {
                "peon": (
                    peon.id
                ),
                "nombre": (
                    peon.nombre
                ),
                "jornales_san_isidro": (
                    Decimal("0.00")
                ),
                "jornales_externos_realizados": (
                    Decimal("0.00")
                ),
                "jornales_a_compensar": (
                    Decimal("0.00")
                ),
                "horas_extra": (
                    Decimal("0.00")
                ),
            }

        # ====================================================
        # RECORRER TARJAS
        # ====================================================

        for tarja in tarjas_periodo:

            fraccion = (
                Decimal(
                    str(
                        tarja.fraccion
                    )
                )
            )

            # ------------------------------------------------
            # TRABAJO PARA SAN ISIDRO
            # ------------------------------------------------

            if (
                tarja.destino
                ==
                Tarja.Destino.SAN_ISIDRO
            ):

                total_jornales_san_isidro += (
                    fraccion
                )

                # --------------------------------------------
                # POR MES
                # --------------------------------------------

                clave_mes = (
                    tarja.fecha.year,
                    tarja.fecha.month,
                )

                jornales_por_mes[
                    clave_mes
                ] += fraccion

                # --------------------------------------------
                # POR TAREA
                # --------------------------------------------

                tarea_codigo = (
                    tarja.tarea
                    or
                    "sin_tarea"
                )

                tarea_nombre = (
                    tarja
                    .get_tarea_display()
                    if tarja.tarea
                    else "Sin tarea"
                )

                tareas[
                    tarea_codigo
                ][
                    "nombre"
                ] = tarea_nombre

                tareas[
                    tarea_codigo
                ][
                    "jornales"
                ] += fraccion

                tareas[
                    tarea_codigo
                ][
                    "registros"
                ] += 1

                # --------------------------------------------
                # PALEADAS
                # --------------------------------------------

                if (
                    tarja.tarea
                    ==
                    Tarja.Tarea.PALEADA
                ):
                    total_paleadas += (
                        fraccion
                    )

                # --------------------------------------------
                # COLABORADOR
                # --------------------------------------------

                if (
                    tarja.peon_id
                    in colaboradores
                ):

                    colaboradores[
                        tarja.peon_id
                    ][
                        "jornales_san_isidro"
                    ] += fraccion

            # ------------------------------------------------
            # TRABAJO EXTERNO
            # ------------------------------------------------

            elif (
                tarja.destino
                ==
                Tarja.Destino.EXTERNO
            ):

                # --------------------------------------------
                # QUIEN TRABAJO PARA OTRO
                # --------------------------------------------

                if (
                    tarja.peon_id
                    in colaboradores
                ):

                    colaboradores[
                        tarja.peon_id
                    ][
                        "jornales_externos_realizados"
                    ] += fraccion

                # --------------------------------------------
                # QUIEN RECIBIO EL TRABAJO
                # --------------------------------------------

                if (
                    tarja.destinatario_id
                    and
                    tarja.destinatario_id
                    in colaboradores
                ):

                    colaboradores[
                        tarja.destinatario_id
                    ][
                        "jornales_a_compensar"
                    ] += fraccion

        # ====================================================
        # HORAS EXTRA
        # ====================================================

        horas_extra = (
            HoraExtra.objects
            .filter(
                is_deleted=False,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .select_related(
                "peon",
            )
        )

        total_horas_extra = (
            Decimal("0.00")
        )

        for hora in horas_extra:

            cantidad = (
                Decimal(
                    str(
                        hora.cantidad_horas
                    )
                )
            )

            total_horas_extra += (
                cantidad
            )

            if (
                hora.peon_id
                in colaboradores
            ):

                colaboradores[
                    hora.peon_id
                ][
                    "horas_extra"
                ] += cantidad

        # ====================================================
        # TRACTOR SERGIO
        # ====================================================

        tractor_sergio = (
            TractorSergio.objects
            .filter(
                is_deleted=False,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .aggregate(
                total=Sum(
                    "cantidad_horas"
                )
            )
        )

        horas_tractor_sergio = (
            tractor_sergio[
                "total"
            ]
            or
            Decimal("0.00")
        )

        # ====================================================
        # TRACTOR TERCEROS
        # ====================================================

        tractor_terceros = (
            TractorTercero.objects
            .filter(
                is_deleted=False,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .aggregate(
                total=Sum(
                    "cantidad_horas"
                )
            )
        )

        horas_tractor_terceros = (
            tractor_terceros[
                "total"
            ]
            or
            Decimal("0.00")
        )

        # ====================================================
        # ALMACIGOS
        # ====================================================

        almacigos = (
            Almacigo.objects
            .filter(
                is_deleted=False,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .aggregate(
                cantidad=Sum(
                    "cantidad"
                )
            )
        )

        cantidad_almacigos = (
            almacigos[
                "cantidad"
            ]
            or
            0
        )

        # ====================================================
        # MULA
        # ====================================================

        registros_mula = (
            JornalCarpida.objects
            .filter(
                is_deleted=False,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .order_by(
                "fecha",
                "id",
            )
        )

        jornales_mula = (
            Decimal("0.00")
        )

        cantidad_registros_mula = 0

        for registro in registros_mula:

            cantidad_registros_mula += 1

            if (
                registro.tipo_jornada
                ==
                JornalCarpida
                .TipoJornada
                .DIA
            ):

                jornales_mula += (
                    Decimal("1.00")
                )

            else:

                jornales_mula += (
                    Decimal("0.50")
                )

        # ====================================================
        # ARMAR JORNALES POR MES
        # ====================================================

        jornales_mes_data = []

        for (
            anio,
            mes,
        ), cantidad in sorted(
            jornales_por_mes.items()
        ):

            jornales_mes_data.append(
                {
                    "anio": (
                        anio
                    ),
                    "mes": (
                        mes
                    ),
                    "mes_nombre": (
                        self._nombre_mes(
                            mes
                        )
                    ),
                    "jornales": (
                        self._decimal_dos(
                            cantidad
                        )
                    ),
                }
            )

        # ====================================================
        # ARMAR TAREAS
        # ====================================================

        tareas_data = []

        for (
            codigo,
            datos,
        ) in tareas.items():

            tareas_data.append(
                {
                    "tarea": (
                        codigo
                    ),
                    "nombre": (
                        datos[
                            "nombre"
                        ]
                    ),
                    "jornales": (
                        self._decimal_dos(
                            datos[
                                "jornales"
                            ]
                        )
                    ),
                    "registros": (
                        datos[
                            "registros"
                        ]
                    ),
                }
            )

        tareas_data.sort(
            key=lambda item: (
                item[
                    "jornales"
                ]
            ),
            reverse=True,
        )

        # ====================================================
        # ARMAR COLABORADORES
        # ====================================================

        colaboradores_data = []

        for item in (
            colaboradores.values()
        ):

            # No mostramos peones completamente
            # vacíos para el período.
            tiene_actividad = (
                item[
                    "jornales_san_isidro"
                ]
                > 0
                or
                item[
                    "jornales_externos_realizados"
                ]
                > 0
                or
                item[
                    "jornales_a_compensar"
                ]
                > 0
                or
                item[
                    "horas_extra"
                ]
                > 0
            )

            if not tiene_actividad:
                continue

            colaboradores_data.append(
                {
                    "peon": (
                        item[
                            "peon"
                        ]
                    ),
                    "nombre": (
                        item[
                            "nombre"
                        ]
                    ),
                    "jornales_san_isidro": (
                        self._decimal_dos(
                            item[
                                "jornales_san_isidro"
                            ]
                        )
                    ),
                    "jornales_externos_realizados": (
                        self._decimal_dos(
                            item[
                                "jornales_externos_realizados"
                            ]
                        )
                    ),
                    "jornales_a_compensar": (
                        self._decimal_dos(
                            item[
                                "jornales_a_compensar"
                            ]
                        )
                    ),
                    "horas_extra": (
                        self._decimal_dos(
                            item[
                                "horas_extra"
                            ]
                        )
                    ),
                }
            )

        colaboradores_data.sort(
            key=lambda item: (
                item[
                    "jornales_san_isidro"
                ]
            ),
            reverse=True,
        )

        # ====================================================
        # RESPUESTA
        # ====================================================

        return Response(
            {
                "periodo": {
                    "fecha_desde": (
                        fecha_desde
                    ),
                    "fecha_hasta": (
                        fecha_hasta
                    ),
                    "campania": (
                        "2026-2027"
                    ),
                },

                "resumen": {
                    "jornales_san_isidro": (
                        self._decimal_dos(
                            total_jornales_san_isidro
                        )
                    ),

                    "horas_extra": (
                        self._decimal_dos(
                            total_horas_extra
                        )
                    ),

                    "horas_tractor_sergio": (
                        self._decimal_dos(
                            horas_tractor_sergio
                        )
                    ),

                    "horas_tractor_terceros": (
                        self._decimal_dos(
                            horas_tractor_terceros
                        )
                    ),

                    "cantidad_almacigos": (
                        cantidad_almacigos
                    ),

                    "jornales_mula": (
                        self._decimal_dos(
                            jornales_mula
                        )
                    ),

                    "registros_mula": (
                        cantidad_registros_mula
                    ),

                    "paleadas": (
                        self._decimal_dos(
                            total_paleadas
                        )
                    ),
                },

                "jornales_por_mes": (
                    jornales_mes_data
                ),

                "por_tarea": (
                    tareas_data
                ),

                "colaboradores": (
                    colaboradores_data
                ),
            }
        )