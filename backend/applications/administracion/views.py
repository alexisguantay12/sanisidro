from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from .permissions import EsAdministracion 
from datetime import date
from calendar import monthrange

from applications.finanzas.movimientos_automaticos import (
    crear_movimiento_liquidacion_personal,
    crear_movimiento_liquidacion_tractor,
    crear_movimiento_liquidacion_almacigo,
    crear_movimiento_rendicion_venta,

    crear_movimiento_liquidacion_carpida,
)


from rest_framework import (
    status,
    viewsets,
)

from applications.gestion.models import (
    Almacigo,
    HoraExtra,
    PagoVenta,
    Peon,
    Proveedor,
    Tarja,
    TractorSergio,
    TractorTercero,
    ValorJornal,
    ConfiguracionPaleada,

    JornalCarpida,
    
)

from applications.administracion.models import (
    DetalleLiquidacionAlmacigo,
    DetalleLiquidacionHoraExtra,
    DetalleLiquidacionTarja,
    DetalleLiquidacionTractor,
    DetalleLiquidacionTarjaExterna,
    DetalleLiquidacionAdministracion,
    DetalleRendicionVenta,
    LiquidacionAlmacigo,
    LiquidacionPersonal,
    LiquidacionTractor,
    RendicionVenta,
    ValorAdministrador,
    LiquidacionCarpida,
    DetalleLiquidacionCarpida,
)

from applications.administracion.serializers import (
    AlmacigoPendientesQuerySerializer,
    CrearRendicionRequestSerializer,
    LiquidacionAlmacigoSerializer,
    LiquidacionPersonalSerializer,
    LiquidacionTractorSerializer,
    LiquidarAlmacigoRequestSerializer,
    LiquidarPersonalRequestSerializer,
    LiquidarTractorRequestSerializer,
    PersonalPendientesQuerySerializer,
    RendicionPendientesQuerySerializer,
    RendicionVentaSerializer,
    TractorPendientesQuerySerializer,
    ValorAdministradorSerializer,

    CarpidaPendientesQuerySerializer,
    LiquidarCarpidaRequestSerializer,
    LiquidacionCarpidaSerializer,
)





# ============================================================
# FUNCIONES AUXILIARES
# ============================================================


class ValorAdministradorViewSet(
    viewsets.ModelViewSet
):
    permission_classes = [
        IsAuthenticated,
        EsAdministracion,
    ]

    serializer_class = (
        ValorAdministradorSerializer
    )

    def get_queryset(self):
        queryset = (
            ValorAdministrador.objects
            .filter(
                is_deleted=False,
            )
            .select_related(
                "peon",
            )
            .order_by(
                "-vigente_desde",
                "-id",
            )
        )

        peon = (
            self.request
            .query_params
            .get(
                "peon"
            )
        )

        if peon:
            queryset = (
                queryset.filter(
                    peon_id=peon
                )
            )

        return queryset

    def perform_create(
        self,
        serializer,
    ):
        serializer.save(
            user_made=(
                self.request.user
            ),
        )

    def perform_update(
        self,
        serializer,
    ):
        serializer.save(
            user_updated=(
                self.request.user
            ),
        )

    def perform_destroy(
        self,
        instance,
    ):
        # ----------------------------------------------------
        # NO PERMITIR BORRAR SI YA SE USO EN LIQUIDACIONES
        # ----------------------------------------------------

        usado = (
            DetalleLiquidacionAdministracion
            .objects
            .filter(
                valor_administrador=(
                    instance
                ),
                is_deleted=False,
            )
            .exists()
        )

        if usado:
            raise ValidationError(
                {
                    "detail": (
                        "No se puede eliminar esta "
                        "configuración porque ya fue "
                        "utilizada en una liquidación."
                    )
                }
            )

        instance.delete(
            user=self.request.user
        )









DOS_DECIMALES = Decimal("0.01")




def meses_del_periodo(
    fecha_desde,
    fecha_hasta,
):
    """
    Devuelve los meses comprendidos en un período.

    Ejemplo:
    15/08/2026 - 10/10/2026

    [
        (2026, 8),
        (2026, 9),
        (2026, 10),
    ]
    """

    meses = []

    anio = fecha_desde.year
    mes = fecha_desde.month

    while (
        anio < fecha_hasta.year
        or (
            anio == fecha_hasta.year
            and mes <= fecha_hasta.month
        )
    ):

        meses.append(
            (
                anio,
                mes,
            )
        )

        mes += 1

        if mes > 12:
            mes = 1
            anio += 1

    return meses


def nombre_mes(mes):
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


def decimal_dos(value):
    return Decimal(str(value)).quantize(
        DOS_DECIMALES
    )



def recalcular_horas_extra_pendientes():
    horas = (
        HoraExtra.objects
        .filter(
            is_deleted=False,
            estado=HoraExtra.Estado.PENDIENTE,
        )
    )

    for hora in horas:
        valor_jornal = (
            obtener_valor_jornal(
                hora.fecha
            )
        )

        valor_hora = (
            (
                valor_jornal.valor
                /
                Decimal("8")
            )
            *
            Decimal("1.25")
        )

        hora.valor_jornal_aplicado = (
            valor_jornal.valor
        )

        hora.valor_hora = (
            valor_hora
        )

        hora.total = (
            valor_hora
            *
            Decimal(
                str(
                    hora.cantidad_horas
                )
            )
        )
        print(hora,"Cambios ",valor_hora)
        hora.save(
            update_fields=[
                "valor_jornal_aplicado",
                "valor_hora",
                "total",
            ]
        )



def obtener_valor_jornal(fecha):
    """
    Obtiene el valor del jornal que correspondía
    exactamente en la fecha indicada.

    La vigencia se determina por:
    - vigente_desde <= fecha
    - vigente_hasta >= fecha
      o vigente_hasta = NULL

    No dependemos de 'activo' para permitir
    consultas y liquidaciones históricas.
    """

    valor = (
        ValorJornal.objects
        .filter(
            is_deleted=False,
            vigente_desde__lte=fecha,
        )
        .filter(
            Q(
                vigente_hasta__gte=fecha
            )
            |
            Q(
                vigente_hasta__isnull=True
            )
        )
        .order_by(
            "-vigente_desde",
            "-id",
        )
        .first()
    )

    if not valor:
        raise ValidationError({
            "valor_jornal": (
                "No existe un valor de jornal "
                f"vigente para la fecha {fecha}."
            )
        })

    return valor


# ============================================================
# LIQUIDACION PERSONAL
# ============================================================
def obtener_valor_tarja(tarja):
    """
    Devuelve el valor unitario que corresponde
    usar para una tarja.

    - Paleada:
      usa la configuración actual de paleada.

    - Resto de tareas:
      usa el valor histórico del jornal
      correspondiente a la fecha de la tarja.
    """

    if (
        tarja.tarea
        == Tarja.Tarea.PALEADA
    ):
        configuracion = (
            ConfiguracionPaleada.objects
            .filter(
                is_deleted=False,
            )
            .order_by("-id")
            .first()
        )

        if not configuracion:
            raise ValidationError({
                "paleada": (
                    "No está configurado "
                    "el valor de la paleada."
                )
            })

        return configuracion.valor

    valor_jornal = (
        obtener_valor_jornal(
            tarja.fecha
        )
    )

    return valor_jornal.valor

class LiquidacionPersonalViewSet(
    ReadOnlyModelViewSet
):
    permission_classes = [
        IsAuthenticated,
        EsAdministracion,
    ]
    serializer_class = (
        LiquidacionPersonalSerializer
    )

    queryset = (
        LiquidacionPersonal.objects
        .filter(
            is_deleted=False,
        )
        .select_related(
            "peon",
            "cuenta_financiera",
        )
        .prefetch_related(
            "detalles_tarjas",
            "detalles_horas_extra",
            "detalles_tarjas_externas",
            "detalles_administracion",
        )
        .order_by(
            "-fecha_pago",
            "-id",
        )
    )

    # --------------------------------------------------------
    # PENDIENTES
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="pendientes",
    )
    def pendientes(self, request):
        serializer = (
            PersonalPendientesQuerySerializer(
                data=request.query_params
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        peon = get_object_or_404(
            Peon.objects.filter(
                is_deleted=False,
            ),
            pk=data["peon"],
        )

        fecha_desde = data["fecha_desde"]
        fecha_hasta = data["fecha_hasta"]

        # ----------------------------------------------------
        # TARJAS PENDIENTES
        # ----------------------------------------------------

        tarjas = (
            Tarja.objects
            .filter(
                is_deleted=False,
                peon=peon,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .exclude(
                detalles_liquidacion__is_deleted=False,
            )
            .order_by(
                "fecha",
                "id",
            )
        )

        tarjas_data = []
        total_tarjas = Decimal("0.00")

        for tarja in tarjas:
            valor_unitario = (
                obtener_valor_tarja(
                    tarja
                )
            )

            fraccion = Decimal(
                str(tarja.fraccion)
            )

            importe = decimal_dos(
                fraccion
                * valor_unitario
            )

            total_tarjas += importe

            tarjas_data.append(
                {
                    "id": tarja.id,
                    "fecha": tarja.fecha,
                    "fraccion": tarja.fraccion,
                    "fraccion_display": (
                        tarja.get_fraccion_display()
                    ),
                    "tarea": tarja.tarea,
                    "tarea_display": (
                        tarja.get_tarea_display()
                        if tarja.tarea
                        else ""
                    ),
                    "destino": tarja.destino,
                    "observacion": (
                        tarja.observacion
                    ),
                    "valor_jornal": (
                        valor_unitario
                    ),
                    "importe": importe,
                }
            )

        # ----------------------------------------------------
        # TARJAS EXTERNAS A DESCONTAR
        # ----------------------------------------------------

        tarjas_externas = (
            Tarja.objects
            .filter(
                is_deleted=False,
                destino=Tarja.Destino.EXTERNO,
                destinatario=peon,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
            )
            .exclude(
                detalles_descuento_liquidacion__is_deleted=False,
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

        tarjas_externas_data = []

        total_descuentos = Decimal(
            "0.00"
        )

        for tarja in tarjas_externas:

            valor_unitario = (
                obtener_valor_tarja(
                    tarja
                )
            )

            fraccion = Decimal(
                str(
                    tarja.fraccion
                )
            )

            importe = decimal_dos(
                fraccion
                * valor_unitario
            )

            total_descuentos += (
                importe
            )

            tarjas_externas_data.append(
                {
                    "id": tarja.id,

                    "fecha": (
                        tarja.fecha
                    ),

                    "peon": (
                        tarja.peon_id
                    ),

                    "peon_nombre": (
                        tarja.peon.nombre
                    ),

                    "fraccion": (
                        tarja.fraccion
                    ),

                    "fraccion_display": (
                        tarja
                        .get_fraccion_display()
                    ),

                    "valor_jornal": (
                        valor_unitario
                    ),

                    "importe": (
                        importe
                    ),

                    "observacion": (
                        tarja.observacion
                    ),
                }
            )

        # ----------------------------------------------------
        # HORAS EXTRA PENDIENTES
        # ----------------------------------------------------

        horas_extra = (
            HoraExtra.objects
            .filter(
                is_deleted=False,
                peon=peon,
                fecha__range=(
                    fecha_desde,
                    fecha_hasta,
                ),
                estado=(
                    HoraExtra.Estado.PENDIENTE
                ),
            )
            .exclude(
                detalles_liquidacion__is_deleted=False,
            )
            .order_by(
                "fecha",
                "id",
            )
        )

        horas_data = []
        total_horas_extra = Decimal("0.00")

        for hora in horas_extra:
            total_horas_extra += hora.total

            horas_data.append(
                {
                    "id": hora.id,
                    "fecha": hora.fecha,
                    "cantidad_horas": (
                        hora.cantidad_horas
                    ),
                    "motivo": hora.motivo,
                    "motivo_display": (
                        hora.get_motivo_display()
                    ),
                    "valor_jornal_aplicado": (
                        hora.valor_jornal_aplicado
                    ),
                    "valor_hora": (
                        hora.valor_hora
                    ),
                    "importe": hora.total,
                }
            )
        # ----------------------------------------------------
        # ADMINISTRACION PENDIENTE
        # ----------------------------------------------------

        administraciones_data = []

        total_administracion = Decimal(
            "0.00"
        )

        for anio, mes in meses_del_periodo(
            fecha_desde,
            fecha_hasta,
        ):

            primer_dia_mes = date(
                anio,
                mes,
                1,
            )

            ultimo_dia_mes = date(
                anio,
                mes,
                monthrange(
                    anio,
                    mes,
                )[1],
            )

            # ------------------------------------------------
            # EL MES DEBE INTERSECTAR EL PERIODO SELECCIONADO
            # ------------------------------------------------

            inicio_consulta = max(
                fecha_desde,
                primer_dia_mes,
            )

            fin_consulta = min(
                fecha_hasta,
                ultimo_dia_mes,
            )

            # ------------------------------------------------
            # VER SI EL PEON ERA ADMINISTRADOR ESE MES
            # ------------------------------------------------

            valor_administrador = (
                ValorAdministrador.objects
                .filter(
                    is_deleted=False,
                    peon=peon,
                    vigente_desde__lte=(
                        fin_consulta
                    ),
                )
                .filter(
                    Q(
                        vigente_hasta__isnull=True
                    )
                    |
                    Q(
                        vigente_hasta__gte=(
                            inicio_consulta
                        )
                    )
                )
                .order_by(
                    "-vigente_desde",
                    "-id",
                )
                .first()
            )

            if not valor_administrador:
                continue

            # ------------------------------------------------
            # VER SI YA COBRO ESE MES
            # ------------------------------------------------

            ya_liquidada = (
                DetalleLiquidacionAdministracion
                .objects
                .filter(
                    valor_administrador__peon=peon,
                    anio=anio,
                    mes=mes,
                    is_deleted=False,
                )
                .exists()
            )

            if ya_liquidada:
                continue

            # ------------------------------------------------
            # VALOR DEL JORNAL
            #
            # Usamos el primer dia del mes como referencia.
            # ------------------------------------------------

            valor_jornal = (
                obtener_valor_jornal(
                    primer_dia_mes
                )
            )

            cantidad_jornales = Decimal(
                str(
                    valor_administrador
                    .cantidad_jornales
                )
            )

            importe = decimal_dos(
                cantidad_jornales
                *
                valor_jornal.valor
            )

            total_administracion += (
                importe
            )

            administraciones_data.append(
                {
                    "valor_administrador": (
                        valor_administrador.id
                    ),

                    "anio": (
                        anio
                    ),

                    "mes": (
                        mes
                    ),

                    "mes_nombre": (
                        nombre_mes(
                            mes
                        )
                    ),

                    "descripcion": (
                        f"Administración "
                        f"{nombre_mes(mes)} "
                        f"{anio}"
                    ),

                    "cantidad_jornales": (
                        cantidad_jornales
                    ),

                    "valor_jornal": (
                        valor_jornal.valor
                    ),

                    "importe": (
                        importe
                    ),
                }
            ) 
 

        return Response(
            {
                "peon": {
                    "id": peon.id,
                    "nombre": peon.nombre,
                },

                "fecha_desde": (
                    fecha_desde
                ),

                "fecha_hasta": (
                    fecha_hasta
                ),

                "tarjas": (
                    tarjas_data
                ),

                "horas_extra": (
                    horas_data
                ),

                "administraciones": (
                    administraciones_data
                ),

                "tarjas_externas": (
                    tarjas_externas_data
                ),

                "resumen": {
                    "cantidad_tarjas": (
                        len(
                            tarjas_data
                        )
                    ),

                    "cantidad_horas_extra": (
                        len(
                            horas_data
                        )
                    ),

                    "cantidad_administraciones": (
                        len(
                            administraciones_data
                        )
                    ),

                    "total_tarjas": (
                        decimal_dos(
                            total_tarjas
                        )
                    ),

                    "total_horas_extra": (
                        decimal_dos(
                            total_horas_extra
                        )
                    ),

                    "total_administracion": (
                        decimal_dos(
                            total_administracion
                        )
                    ),

                    "cantidad_tarjas_externas": (
                        len(
                            tarjas_externas_data
                        )
                    ),

                    "total_descuentos": (
                        decimal_dos(
                            total_descuentos
                        )
                    ),

                    "total": decimal_dos(
                        total_tarjas
                        +
                        total_horas_extra
                        +
                        total_administracion
                        -
                        total_descuentos
                    ),
                },
            }
        )

    # --------------------------------------------------------
    # LIQUIDAR PERSONAL
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["post"],
        url_path="liquidar",
    )
    def liquidar(
        self,
        request,
    ):

        # =========================================================
        # VALIDAR REQUEST
        # =========================================================

        serializer = (
            LiquidarPersonalRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        usuario = request.user

        cuenta_financiera = data[
            "cuenta_financiera"
        ]

        peon = get_object_or_404(
            Peon.objects.filter(
                is_deleted=False,
            ),
            pk=data["peon"],
        )

        fecha_desde = data[
            "fecha_desde"
        ]

        fecha_hasta = data[
            "fecha_hasta"
        ]

        tarjas_ids = data.get(
            "tarjas",
            [],
        )

        horas_ids = data.get(
            "horas_extra",
            [],
        )

        administraciones_request = data.get(
            "administraciones",
            [],
        )

        # =========================================================
        # TRANSACCION
        # =========================================================

        with transaction.atomic():

            # =====================================================
            # TARJAS NORMALES
            # =====================================================

            tarjas = list(
                Tarja.objects
                .select_for_update()
                .filter(
                    id__in=tarjas_ids,
                    is_deleted=False,
                )
                .order_by(
                    "fecha",
                    "id",
                )
            )

            if (
                len(tarjas)
                != len(tarjas_ids)
            ):
                raise ValidationError(
                    {
                        "tarjas": (
                            "Una o más tarjas "
                            "no existen."
                        )
                    }
                )

            # =====================================================
            # HORAS EXTRA
            # =====================================================

            horas = list(
                HoraExtra.objects
                .select_for_update()
                .filter(
                    id__in=horas_ids,
                    is_deleted=False,
                )
                .order_by(
                    "fecha",
                    "id",
                )
            )

            if (
                len(horas)
                != len(horas_ids)
            ):
                raise ValidationError(
                    {
                        "horas_extra": (
                            "Una o más horas extra "
                            "no existen."
                        )
                    }
                )

            # =====================================================
            # TARJAS EXTERNAS A DESCONTAR
            # =====================================================

            tarjas_externas = list(
                Tarja.objects
                .select_for_update()
                .filter(
                    is_deleted=False,
                    destino=(
                        Tarja
                        .Destino
                        .EXTERNO
                    ),
                    destinatario=peon,
                    fecha__range=(
                        fecha_desde,
                        fecha_hasta,
                    ),
                )
                .exclude(
                    detalles_descuento_liquidacion__is_deleted=False,
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

            # =====================================================
            # VALIDAR Y CALCULAR TARJAS NORMALES
            # =====================================================

            total_tarjas = Decimal(
                "0.00"
            )

            datos_tarjas = []

            for tarja in tarjas:

                # -------------------------------------------------
                # PERTENECE AL PEON
                # -------------------------------------------------

                if (
                    tarja.peon_id
                    != peon.id
                ):
                    raise ValidationError(
                        {
                            "tarjas": (
                                f"La tarja #{tarja.id} "
                                "no pertenece al peón "
                                "seleccionado."
                            )
                        }
                    )

                # -------------------------------------------------
                # PERIODO
                # -------------------------------------------------

                if not (
                    fecha_desde
                    <= tarja.fecha
                    <= fecha_hasta
                ):
                    raise ValidationError(
                        {
                            "tarjas": (
                                f"La tarja #{tarja.id} "
                                "está fuera del período."
                            )
                        }
                    )

                # -------------------------------------------------
                # YA LIQUIDADA
                # -------------------------------------------------

                ya_liquidada = (
                    DetalleLiquidacionTarja
                    .objects
                    .filter(
                        tarja=tarja,
                        is_deleted=False,
                        liquidacion__is_deleted=False, 
                    )
                    .exists()
                )

                if ya_liquidada:
                    raise ValidationError(
                        {
                            "tarjas": (
                                f"La tarja #{tarja.id} "
                                "ya fue liquidada."
                            )
                        }
                    )

                # -------------------------------------------------
                # CALCULAR
                # -------------------------------------------------

                valor_unitario = (
                    obtener_valor_tarja(
                        tarja
                    )
                )

                fraccion = Decimal(
                    str(
                        tarja.fraccion
                    )
                )

                importe = decimal_dos(
                    valor_unitario
                    *
                    fraccion
                )

                total_tarjas += (
                    importe
                )

                datos_tarjas.append(
                    {
                        "tarja": tarja,

                        "valor_jornal": (
                            valor_unitario
                        ),

                        "fraccion": (
                            fraccion
                        ),

                        "importe": (
                            importe
                        ),
                    }
                )

            # =====================================================
            # VALIDAR Y CALCULAR HORAS EXTRA
            # =====================================================

            total_horas = Decimal(
                "0.00"
            )

            for hora in horas:

                # -------------------------------------------------
                # PERTENECE AL PEON
                # -------------------------------------------------

                if (
                    hora.peon_id
                    != peon.id
                ):
                    raise ValidationError(
                        {
                            "horas_extra": (
                                f"La hora extra "
                                f"#{hora.id} no pertenece "
                                "al peón seleccionado."
                            )
                        }
                    )

                # -------------------------------------------------
                # PERIODO
                # -------------------------------------------------

                if not (
                    fecha_desde
                    <= hora.fecha
                    <= fecha_hasta
                ):
                    raise ValidationError(
                        {
                            "horas_extra": (
                                f"La hora extra "
                                f"#{hora.id} está fuera "
                                "del período."
                            )
                        }
                    )

                # -------------------------------------------------
                # ESTADO
                # -------------------------------------------------

                if (
                    hora.estado
                    != HoraExtra
                    .Estado
                    .PENDIENTE
                ):
                    raise ValidationError(
                        {
                            "horas_extra": (
                                f"La hora extra "
                                f"#{hora.id} ya no está "
                                "pendiente."
                            )
                        }
                    )

                # -------------------------------------------------
                # YA LIQUIDADA
                # -------------------------------------------------

                ya_liquidada = (
                    DetalleLiquidacionHoraExtra
                    .objects
                    .filter(
                        hora_extra=hora,
                        is_deleted=False,
                        liquidacion__is_deleted=False, 
                    )
                    .exists()
                )

                if ya_liquidada:
                    raise ValidationError(
                        {
                            "horas_extra": (
                                f"La hora extra "
                                f"#{hora.id} ya fue "
                                "liquidada."
                            )
                        }
                    )

                total_horas += (
                    hora.total
                )

            # =====================================================
            # TARJAS EXTERNAS / DESCUENTOS
            # =====================================================

            total_descuentos = Decimal(
                "0.00"
            )

            datos_descuentos = []

            for tarja in tarjas_externas:

                # -------------------------------------------------
                # COMPROBAR QUE NO HAYA SIDO DESCONTADA
                # -------------------------------------------------

                ya_descontada = (
                    DetalleLiquidacionTarjaExterna
                    .objects
                    .filter(
                        tarja=tarja,
                        is_deleted=False,
                        liquidacion__is_deleted=False, 
                    )
                    .exists()
                )

                if ya_descontada:
                    continue

                valor_unitario = (
                    obtener_valor_tarja(
                        tarja
                    )
                )

                fraccion = Decimal(
                    str(
                        tarja.fraccion
                    )
                )

                importe = decimal_dos(
                    valor_unitario
                    *
                    fraccion
                )

                total_descuentos += (
                    importe
                )

                datos_descuentos.append(
                    {
                        "tarja": (
                            tarja
                        ),

                        "peon_origen": (
                            tarja.peon
                        ),

                        "fraccion": (
                            fraccion
                        ),

                        "valor_jornal": (
                            valor_unitario
                        ),

                        "importe": (
                            importe
                        ),
                    }
                )

            # =====================================================
            # ADMINISTRACION
            # =====================================================

            total_administracion = Decimal(
                "0.00"
            )

            datos_administracion = []

            for item in administraciones_request:

                valor_administrador_id = (
                    item[
                        "valor_administrador"
                    ]
                )

                anio = item[
                    "anio"
                ]

                mes = item[
                    "mes"
                ]

                # -------------------------------------------------
                # BLOQUEAR LA CONFIGURACION
                # -------------------------------------------------
                #
                # Esto hace que dos liquidaciones simultaneas
                # del mismo administrador no puedan avanzar
                # al mismo tiempo.
                # -------------------------------------------------

                try:

                    valor_administrador = (
                        ValorAdministrador
                        .objects
                        .select_for_update()
                        .select_related(
                            "peon"
                        )
                        .get(
                            id=(
                                valor_administrador_id
                            ),
                            is_deleted=False,
                        )
                    )

                except (
                    ValorAdministrador
                    .DoesNotExist
                ):

                    raise ValidationError(
                        {
                            "administraciones": (
                                "La configuración de "
                                "administración seleccionada "
                                "no existe."
                            )
                        }
                    )

                # -------------------------------------------------
                # DEBE SER DEL PEON QUE ESTAMOS LIQUIDANDO
                # -------------------------------------------------

                if (
                    valor_administrador
                    .peon_id
                    != peon.id
                ):
                    raise ValidationError(
                        {
                            "administraciones": (
                                "La administración "
                                "seleccionada no corresponde "
                                "al peón que se está "
                                "liquidando."
                            )
                        }
                    )

                # -------------------------------------------------
                # FECHAS DEL MES
                # -------------------------------------------------

                try:

                    primer_dia_mes = date(
                        anio,
                        mes,
                        1,
                    )

                    ultimo_dia_mes = date(
                        anio,
                        mes,
                        monthrange(
                            anio,
                            mes,
                        )[1],
                    )

                except (
                    TypeError,
                    ValueError,
                ):

                    raise ValidationError(
                        {
                            "administraciones": (
                                "El período de "
                                "administración no es válido."
                            )
                        }
                    )

                # -------------------------------------------------
                # EL MES TIENE QUE INTERSECTAR EL PERIODO
                # SELECCIONADO EN LA LIQUIDACION
                # -------------------------------------------------

                if (
                    ultimo_dia_mes
                    < fecha_desde
                    or
                    primer_dia_mes
                    > fecha_hasta
                ):
                    raise ValidationError(
                        {
                            "administraciones": (
                                f"La administración de "
                                f"{nombre_mes(mes)} "
                                f"{anio} está fuera del "
                                "período seleccionado."
                            )
                        }
                    )

                # -------------------------------------------------
                # PERIODO EFECTIVAMENTE CONSULTADO DENTRO DEL MES
                # -------------------------------------------------

                inicio_periodo_mes = max(
                    fecha_desde,
                    primer_dia_mes,
                )

                fin_periodo_mes = min(
                    fecha_hasta,
                    ultimo_dia_mes,
                )

                # -------------------------------------------------
                # COMPROBAR VIGENCIA DEL ADMINISTRADOR
                # -------------------------------------------------

                if (
                    valor_administrador
                    .vigente_desde
                    > fin_periodo_mes
                ):
                    raise ValidationError(
                        {
                            "administraciones": (
                                f"{peon.nombre} no era "
                                "administrador durante "
                                f"{nombre_mes(mes)} "
                                f"{anio}."
                            )
                        }
                    )

                if (
                    valor_administrador
                    .vigente_hasta
                    is not None
                    and
                    valor_administrador
                    .vigente_hasta
                    < inicio_periodo_mes
                ):
                    raise ValidationError(
                        {
                            "administraciones": (
                                f"{peon.nombre} no era "
                                "administrador durante "
                                f"{nombre_mes(mes)} "
                                f"{anio}."
                            )
                        }
                    )

                # -------------------------------------------------
                # COMPROBAR QUE EL MES NO ESTE YA PAGADO
                # EN UNA LIQUIDACION ACTIVA
                # -------------------------------------------------

                ya_liquidada = (
                    DetalleLiquidacionAdministracion
                    .objects
                    .filter(
                        valor_administrador__peon=peon,
                        anio=anio,
                        mes=mes,
                        is_deleted=False,
                    )
                    .exists()
                )

                if ya_liquidada:

                    raise ValidationError(
                        {
                            "administraciones": (
                                f"La administración de "
                                f"{nombre_mes(mes)} "
                                f"{anio} ya fue liquidada."
                            )
                        }
                    )

                # -------------------------------------------------
                # OBTENER JORNAL DEL MES
                # -------------------------------------------------
                #
                # La referencia elegida es el primer día del mes.
                #
                # Septiembre 2026 -> valor jornal vigente
                # al 01/09/2026.
                # -------------------------------------------------

                valor_jornal = (
                    obtener_valor_jornal(
                        primer_dia_mes
                    )
                )

                cantidad_jornales = (
                    Decimal(
                        str(
                            valor_administrador
                            .cantidad_jornales
                        )
                    )
                )

                importe = decimal_dos(
                    cantidad_jornales
                    *
                    valor_jornal.valor
                )

                total_administracion += (
                    importe
                )

                datos_administracion.append(
                    {
                        "valor_administrador": (
                            valor_administrador
                        ),

                        "anio": (
                            anio
                        ),

                        "mes": (
                            mes
                        ),

                        "cantidad_jornales": (
                            cantidad_jornales
                        ),

                        "valor_jornal": (
                            valor_jornal.valor
                        ),

                        "importe": (
                            importe
                        ),
                    }
                )

            # =====================================================
            # NORMALIZAR TOTALES
            # =====================================================

            total_tarjas = decimal_dos(
                total_tarjas
            )

            total_horas = decimal_dos(
                total_horas
            )

            total_administracion = (
                decimal_dos(
                    total_administracion
                )
            )

            total_descuentos = (
                decimal_dos(
                    total_descuentos
                )
            )

            # =====================================================
            # TOTAL FINAL
            # =====================================================

            total = decimal_dos(
                total_tarjas
                +
                total_horas
                +
                total_administracion
                -
                total_descuentos
            )

            # =====================================================
            # NO PERMITIR TOTAL NEGATIVO
            # =====================================================

            if (
                total
                < Decimal("0.00")
            ):
                raise ValidationError(
                    {
                        "total": (
                            "Los descuentos superan "
                            "el total a pagar. "
                            "No se puede generar una "
                            "liquidación negativa."
                        )
                    }
                )

            # =====================================================
            # CREAR CABECERA
            # =====================================================

            liquidacion = (
                LiquidacionPersonal
                .objects
                .create(
                    peon=(
                        peon
                    ),

                    fecha_desde=(
                        fecha_desde
                    ),

                    fecha_hasta=(
                        fecha_hasta
                    ),

                    fecha_pago=(
                        data[
                            "fecha_pago"
                        ]
                    ),

                    cuenta_financiera=(
                        cuenta_financiera
                    ),

                    total_tarjas=(
                        total_tarjas
                    ),

                    total_horas_extra=(
                        total_horas
                    ),

                    total_administracion=(
                        total_administracion
                    ),

                    total_descuentos=(
                        total_descuentos
                    ),

                    total=(
                        total
                    ),

                    observacion=(
                        data[
                            "observacion"
                        ]
                    ),

                    user_made=(
                        usuario
                    ),
                )
            )

            # =====================================================
            # DETALLES TARJAS NORMALES
            # =====================================================

            for item in datos_tarjas:

                tarja = item[
                    "tarja"
                ]

                (
                    DetalleLiquidacionTarja
                    .objects
                    .create(
                        liquidacion=(
                            liquidacion
                        ),

                        tarja=(
                            tarja
                        ),

                        fecha=(
                            tarja.fecha
                        ),

                        fraccion=(
                            item[
                                "fraccion"
                            ]
                        ),

                        valor_jornal_aplicado=(
                            item[
                                "valor_jornal"
                            ]
                        ),

                        importe=(
                            item[
                                "importe"
                            ]
                        ),

                        tarea=(
                            tarja.tarea
                        ),

                        observacion=(
                            tarja.observacion
                        ),

                        user_made=(
                            usuario
                        ),
                    )
                )

            # =====================================================
            # DETALLES DESCUENTOS / TARJAS EXTERNAS
            # =====================================================

            for item in datos_descuentos:

                tarja = item[
                    "tarja"
                ]

                (
                    DetalleLiquidacionTarjaExterna
                    .objects
                    .create(
                        liquidacion=(
                            liquidacion
                        ),

                        tarja=(
                            tarja
                        ),

                        peon_origen=(
                            item[
                                "peon_origen"
                            ]
                        ),

                        fecha=(
                            tarja.fecha
                        ),

                        fraccion=(
                            item[
                                "fraccion"
                            ]
                        ),

                        valor_jornal_aplicado=(
                            item[
                                "valor_jornal"
                            ]
                        ),

                        importe=(
                            item[
                                "importe"
                            ]
                        ),

                        user_made=(
                            usuario
                        ),
                    )
                )

            # =====================================================
            # DETALLES HORAS EXTRA
            # =====================================================

            for hora in horas:

                (
                    DetalleLiquidacionHoraExtra
                    .objects
                    .create(
                        liquidacion=(
                            liquidacion
                        ),

                        hora_extra=(
                            hora
                        ),

                        fecha=(
                            hora.fecha
                        ),

                        cantidad_horas=(
                            hora
                            .cantidad_horas
                        ),

                        motivo=(
                            hora.motivo
                        ),

                        valor_jornal_aplicado=(
                            hora
                            .valor_jornal_aplicado
                        ),

                        valor_hora=(
                            hora.valor_hora
                        ),

                        importe=(
                            hora.total
                        ),

                        user_made=(
                            usuario
                        ),
                    )
                )

                hora.estado = (
                    HoraExtra
                    .Estado
                    .LIQUIDADA
                )

                hora.user_updated = (
                    usuario
                )

                hora.save(
                    update_fields=[
                        "estado",
                        "user_updated",
                        "updated_at",
                    ]
                )

            # =====================================================
            # DETALLES ADMINISTRACION
            # =====================================================

            for item in datos_administracion:

                (
                    DetalleLiquidacionAdministracion
                    .objects
                    .create(
                        liquidacion=(
                            liquidacion
                        ),

                        valor_administrador=(
                            item[
                                "valor_administrador"
                            ]
                        ),

                        anio=(
                            item[
                                "anio"
                            ]
                        ),

                        mes=(
                            item[
                                "mes"
                            ]
                        ),

                        cantidad_jornales=(
                            item[
                                "cantidad_jornales"
                            ]
                        ),

                        valor_jornal_aplicado=(
                            item[
                                "valor_jornal"
                            ]
                        ),

                        importe=(
                            item[
                                "importe"
                            ]
                        ),

                        user_made=(
                            usuario
                        ),
                    )
                )

            # =====================================================
            # MOVIMIENTO FINANCIERO
            # =====================================================

            crear_movimiento_liquidacion_personal(
                liquidacion=(
                    liquidacion
                ),

                cuenta=(
                    cuenta_financiera
                ),

                usuario=(
                    usuario
                ),
            )

        # =========================================================
        # RESPUESTA
        # =========================================================

        resultado = (
            LiquidacionPersonalSerializer(
                liquidacion
            )
        )

        return Response(
            resultado.data,
            status=(
                status.HTTP_201_CREATED
            ),
        )

# ============================================================
# LIQUIDACION TRACTOR
# ============================================================


class LiquidacionTractorViewSet(
    ReadOnlyModelViewSet
):
    permission_classes = [
        IsAuthenticated,
        EsAdministracion,
    ]

    serializer_class = (
        LiquidacionTractorSerializer
    )

    queryset = (
        LiquidacionTractor.objects
        .filter(
            is_deleted=False,
        )
        .select_related(
            "proveedor",
            "cuenta_financiera",
        )
        .prefetch_related(
            "detalles",
        )
        .order_by(
            "-fecha_pago",
            "-id",
        )
    )

    # --------------------------------------------------------
    # PENDIENTES
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="pendientes",
    )
    def pendientes(self, request):

        serializer = (
            TractorPendientesQuerySerializer(
                data=request.query_params
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        tipo = data["tipo"]

        fecha_desde = data[
            "fecha_desde"
        ]

        fecha_hasta = data[
            "fecha_hasta"
        ]

        trabajos_data = []

        total_horas = Decimal("0.00")
        total = Decimal("0.00")

        proveedor = None

        # ====================================================
        # SERGIO
        # ====================================================

        if (
            tipo
            == LiquidacionTractor.TIPO_SERGIO
        ):

            trabajos = (
                TractorSergio.objects
                .filter(
                    is_deleted=False,
                    estado=(
                        TractorSergio
                        .ESTADO_PENDIENTE
                    ),
                    fecha__range=(
                        fecha_desde,
                        fecha_hasta,
                    ),
                )
                .exclude(
                    detalles_liquidacion__is_deleted=False,
                )
                .order_by(
                    "fecha",
                    "id",
                )
            )

            for trabajo in trabajos:

                total_horas += (
                    trabajo.cantidad_horas
                )

                total += trabajo.importe

                trabajos_data.append(
                    {
                        "id": trabajo.id,

                        "fecha": (
                            trabajo.fecha
                        ),

                        "cantidad_horas": (
                            trabajo.cantidad_horas
                        ),

                        "valor_hora": (
                            trabajo.valor_hora
                        ),

                        "importe": (
                            trabajo.importe
                        ),

                        "observacion": (
                            trabajo.observacion
                        ),
                    }
                )

        # ====================================================
        # TERCEROS
        # ====================================================

        else:

            proveedor = get_object_or_404(
                Proveedor.objects.filter(
                    is_deleted=False,
                ),
                pk=data["proveedor"],
            )

            trabajos = (
                TractorTercero.objects
                .filter(
                    is_deleted=False,
                    estado=(
                        TractorTercero
                        .ESTADO_PENDIENTE
                    ),
                    proveedor=proveedor,
                    fecha__range=(
                        fecha_desde,
                        fecha_hasta,
                    ),
                )
                .exclude(
                    detalles_liquidacion__is_deleted=False,
                )
                .select_related(
                    "proveedor",
                )
                .order_by(
                    "fecha",
                    "id",
                )
            )

            for trabajo in trabajos:

                total_horas += (
                    trabajo.cantidad_horas
                )

                total += trabajo.importe

                trabajos_data.append(
                    {
                        "id": trabajo.id,

                        "fecha": (
                            trabajo.fecha
                        ),

                        "cantidad_horas": (
                            trabajo.cantidad_horas
                        ),

                        "valor_hora": (
                            trabajo.precio_hora
                        ),

                        "importe": (
                            trabajo.importe
                        ),

                        "observacion": (
                            trabajo.observacion
                        ),
                    }
                )

        return Response(
            {
                "tipo": tipo,

                "proveedor": (
                    {
                        "id": proveedor.id,
                        "nombre": (
                            proveedor.nombre
                        ),
                    }
                    if proveedor
                    else None
                ),

                "fecha_desde": (
                    fecha_desde
                ),

                "fecha_hasta": (
                    fecha_hasta
                ),

                "trabajos": (
                    trabajos_data
                ),

                "resumen": {
                    "cantidad_trabajos": (
                        len(
                            trabajos_data
                        )
                    ),

                    "total_horas": (
                        decimal_dos(
                            total_horas
                        )
                    ),

                    "total": (
                        decimal_dos(
                            total
                        )
                    ),
                },
            }
        )

    # --------------------------------------------------------
    # LIQUIDAR
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["post"],
        url_path="liquidar",
    )
    def liquidar(self, request):

        serializer = (
            LiquidarTractorRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        tipo = data["tipo"]

        ids = data["trabajos"]

        cuenta_financiera = data[
            "cuenta_financiera"
        ]

        fecha_desde = data[
            "fecha_desde"
        ]

        fecha_hasta = data[
            "fecha_hasta"
        ]

        usuario = request.user

        proveedor = None

        with transaction.atomic():

            # =================================================
            # OBTENER TRABAJOS
            # =================================================

            if (
                tipo
                == LiquidacionTractor.TIPO_SERGIO
            ):

                trabajos = list(
                    TractorSergio.objects
                    .select_for_update()
                    .filter(
                        id__in=ids,
                        is_deleted=False,
                    )
                    .order_by(
                        "fecha",
                        "id",
                    )
                )

            else:

                proveedor = (
                    get_object_or_404(
                        Proveedor.objects.filter(
                            is_deleted=False,
                        ),
                        pk=data["proveedor"],
                    )
                )

                trabajos = list(
                    TractorTercero.objects
                    .select_for_update()
                    .filter(
                        id__in=ids,
                        is_deleted=False,
                    )
                    .select_related(
                        "proveedor",
                    )
                    .order_by(
                        "fecha",
                        "id",
                    )
                )

            # =================================================
            # VALIDAR EXISTENCIA
            # =================================================

            if (
                len(trabajos)
                != len(ids)
            ):
                raise ValidationError(
                    {
                        "trabajos": (
                            "Uno o más trabajos "
                            "no existen."
                        )
                    }
                )

            total_horas = Decimal(
                "0.00"
            )

            total = Decimal(
                "0.00"
            )

            # =================================================
            # VALIDACIONES
            # =================================================

            for trabajo in trabajos:

                # ---------------------------------------------
                # PERIODO
                # ---------------------------------------------

                if not (
                    fecha_desde
                    <= trabajo.fecha
                    <= fecha_hasta
                ):
                    raise ValidationError(
                        {
                            "trabajos": (
                                f"El trabajo "
                                f"#{trabajo.id} "
                                "está fuera del período."
                            )
                        }
                    )

                # ---------------------------------------------
                # ESTADO
                # ---------------------------------------------

                if (
                    trabajo.estado
                    != trabajo.ESTADO_PENDIENTE
                ):
                    raise ValidationError(
                        {
                            "trabajos": (
                                f"El trabajo "
                                f"#{trabajo.id} "
                                "ya no está pendiente."
                            )
                        }
                    )

                # ---------------------------------------------
                # PROVEEDOR
                # ---------------------------------------------

                if (
                    tipo
                    == LiquidacionTractor
                    .TIPO_TERCERO
                    and trabajo.proveedor_id
                    != proveedor.id
                ):
                    raise ValidationError(
                        {
                            "trabajos": (
                                f"El trabajo "
                                f"#{trabajo.id} "
                                "corresponde a otro "
                                "proveedor."
                            )
                        }
                    )

                # ---------------------------------------------
                # YA LIQUIDADO
                # ---------------------------------------------

                filtro = {
                    "is_deleted": False,
                }

                if (
                    tipo
                    == LiquidacionTractor
                    .TIPO_SERGIO
                ):
                    filtro[
                        "tractor_sergio"
                    ] = trabajo

                else:
                    filtro[
                        "tractor_tercero"
                    ] = trabajo

                ya_liquidado = (
                    DetalleLiquidacionTractor
                    .objects
                    .filter(
                        **filtro
                    )
                    .exists()
                )

                if ya_liquidado:
                    raise ValidationError(
                        {
                            "trabajos": (
                                f"El trabajo "
                                f"#{trabajo.id} "
                                "ya fue liquidado."
                            )
                        }
                    )

                # ---------------------------------------------
                # TOTALES
                # ---------------------------------------------

                total_horas += (
                    trabajo.cantidad_horas
                )

                total += (
                    trabajo.importe
                )

            total_horas = (
                decimal_dos(
                    total_horas
                )
            )

            total = (
                decimal_dos(
                    total
                )
            )

            # =================================================
            # CREAR LIQUIDACION
            # =================================================

            liquidacion = (
                LiquidacionTractor.objects
                .create(
                    tipo=tipo,

                    proveedor=proveedor,

                    fecha_desde=(
                        fecha_desde
                    ),

                    fecha_hasta=(
                        fecha_hasta
                    ),

                    fecha_pago=data[
                        "fecha_pago"
                    ],

                    cuenta_financiera=(
                        cuenta_financiera
                    ),

                    total_horas=(
                        total_horas
                    ),

                    total=total,

                    observacion=data[
                        "observacion"
                    ],

                    user_made=usuario,
                )
            )

            # =================================================
            # CREAR DETALLES
            # =================================================

            for trabajo in trabajos:

                if (
                    tipo
                    == LiquidacionTractor
                    .TIPO_SERGIO
                ):
                    valor_hora = (
                        trabajo.valor_hora
                    )

                    tractor_sergio = (
                        trabajo
                    )

                    tractor_tercero = None

                else:
                    valor_hora = (
                        trabajo.precio_hora
                    )

                    tractor_sergio = None

                    tractor_tercero = (
                        trabajo
                    )

                (
                    DetalleLiquidacionTractor
                    .objects
                    .create(
                        liquidacion=(
                            liquidacion
                        ),

                        tractor_sergio=(
                            tractor_sergio
                        ),

                        tractor_tercero=(
                            tractor_tercero
                        ),

                        fecha=(
                            trabajo.fecha
                        ),

                        cantidad_horas=(
                            trabajo
                            .cantidad_horas
                        ),

                        valor_hora=(
                            valor_hora
                        ),

                        importe=(
                            trabajo.importe
                        ),

                        observacion=(
                            trabajo.observacion
                        ),

                        user_made=usuario,
                    )
                )

                # =============================================
                # MARCAR TRABAJO COMO PAGADO
                # =============================================

                trabajo.estado = (
                    trabajo.ESTADO_PAGADA
                )

                trabajo.user_updated = (
                    usuario
                )

                trabajo.save()

            # =================================================
            # MOVIMIENTO FINANCIERO
            # =================================================

            crear_movimiento_liquidacion_tractor(
                liquidacion=liquidacion,
                cuenta=cuenta_financiera,
                usuario=usuario,
            )

        # =====================================================
        # RESPUESTA
        # =====================================================

        resultado = (
            LiquidacionTractorSerializer(
                liquidacion
            )
        )

        return Response(
            resultado.data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# LIQUIDACION ALMACIGOS
# ============================================================


class LiquidacionAlmacigoViewSet(
    ReadOnlyModelViewSet
):
    permission_classes = [
        IsAuthenticated,
        EsAdministracion,
    ]

    serializer_class = (
        LiquidacionAlmacigoSerializer
    )

    queryset = (
        LiquidacionAlmacigo.objects
        .filter(
            is_deleted=False,
        )
        .select_related(
            "cuenta_financiera",
        )
        .prefetch_related(
            "detalles",
        )
        .order_by(
            "-fecha_pago",
            "-id",
        )
    )

    # --------------------------------------------------------
    # PENDIENTES
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="pendientes",
    )
    def pendientes(self, request):

        serializer = (
            AlmacigoPendientesQuerySerializer(
                data=request.query_params
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        almacigos = (
            Almacigo.objects
            .filter(
                is_deleted=False,
                estado=(
                    Almacigo
                    .ESTADO_PENDIENTE
                ),
                fecha__range=(
                    data["fecha_desde"],
                    data["fecha_hasta"],
                ),
            )
            .exclude(
                detalles_liquidacion__is_deleted=False,
            )
            .order_by(
                "fecha",
                "id",
            )
        )

        items = []

        cantidad_total = 0

        total = Decimal(
            "0.00"
        )

        for almacigo in almacigos:

            cantidad_total += (
                almacigo.cantidad
            )

            total += (
                almacigo.importe
            )

            items.append(
                {
                    "id": (
                        almacigo.id
                    ),

                    "fecha": (
                        almacigo.fecha
                    ),

                    "cantidad": (
                        almacigo.cantidad
                    ),

                    "valor_unitario": (
                        almacigo
                        .valor_unitario
                    ),

                    "importe": (
                        almacigo.importe
                    ),

                    "observacion": (
                        almacigo
                        .observacion
                    ),
                }
            )

        return Response(
            {
                "fecha_desde": (
                    data[
                        "fecha_desde"
                    ]
                ),

                "fecha_hasta": (
                    data[
                        "fecha_hasta"
                    ]
                ),

                "almacigos": items,

                "resumen": {
                    "cantidad_registros": (
                        len(
                            items
                        )
                    ),

                    "cantidad_total": (
                        cantidad_total
                    ),

                    "total": (
                        decimal_dos(
                            total
                        )
                    ),
                },
            }
        )

    # --------------------------------------------------------
    # LIQUIDAR
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["post"],
        url_path="liquidar",
    )
    def liquidar(self, request):

        serializer = (
            LiquidarAlmacigoRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        ids = data[
            "almacigos"
        ]

        cuenta_financiera = data[
            "cuenta_financiera"
        ]

        usuario = (
            request.user
        )

        with transaction.atomic():

            # =================================================
            # OBTENER ALMACIGOS
            # =================================================

            almacigos = list(
                Almacigo.objects
                .select_for_update()
                .filter(
                    id__in=ids,
                    is_deleted=False,
                )
                .order_by(
                    "fecha",
                    "id",
                )
            )

            # =================================================
            # VALIDAR EXISTENCIA
            # =================================================

            if (
                len(almacigos)
                != len(ids)
            ):
                raise ValidationError(
                    {
                        "almacigos": (
                            "Uno o más almácigos "
                            "no existen."
                        )
                    }
                )

            cantidad_total = 0

            total = Decimal(
                "0.00"
            )

            # =================================================
            # VALIDACIONES
            # =================================================

            for almacigo in almacigos:

                # ---------------------------------------------
                # PERIODO
                # ---------------------------------------------

                if not (
                    data[
                        "fecha_desde"
                    ]
                    <= almacigo.fecha
                    <= data[
                        "fecha_hasta"
                    ]
                ):
                    raise ValidationError(
                        {
                            "almacigos": (
                                f"El almácigo "
                                f"#{almacigo.id} "
                                "está fuera del período."
                            )
                        }
                    )

                # ---------------------------------------------
                # ESTADO
                # ---------------------------------------------

                if (
                    almacigo.estado
                    !=
                    Almacigo
                    .ESTADO_PENDIENTE
                ):
                    raise ValidationError(
                        {
                            "almacigos": (
                                f"El almácigo "
                                f"#{almacigo.id} "
                                "ya no está pendiente."
                            )
                        }
                    )

                # ---------------------------------------------
                # YA LIQUIDADO
                # ---------------------------------------------

                ya_liquidado = (
                    DetalleLiquidacionAlmacigo
                    .objects
                    .filter(
                        almacigo=almacigo,
                        is_deleted=False,
                    )
                    .exists()
                )

                if ya_liquidado:
                    raise ValidationError(
                        {
                            "almacigos": (
                                f"El almácigo "
                                f"#{almacigo.id} "
                                "ya fue liquidado."
                            )
                        }
                    )

                # ---------------------------------------------
                # TOTALES
                # ---------------------------------------------

                cantidad_total += (
                    almacigo.cantidad
                )

                total += (
                    almacigo.importe
                )

            total = (
                decimal_dos(
                    total
                )
            )

            # =================================================
            # CREAR LIQUIDACION
            # =================================================

            liquidacion = (
                LiquidacionAlmacigo.objects
                .create(
                    fecha_desde=(
                        data[
                            "fecha_desde"
                        ]
                    ),

                    fecha_hasta=(
                        data[
                            "fecha_hasta"
                        ]
                    ),

                    fecha_pago=(
                        data[
                            "fecha_pago"
                        ]
                    ),

                    cuenta_financiera=(
                        cuenta_financiera
                    ),

                    cantidad_total=(
                        cantidad_total
                    ),

                    total=total,

                    observacion=(
                        data[
                            "observacion"
                        ]
                    ),

                    user_made=(
                        usuario
                    ),
                )
            )

            # =================================================
            # CREAR DETALLES
            # =================================================

            for almacigo in almacigos:

                (
                    DetalleLiquidacionAlmacigo
                    .objects
                    .create(
                        liquidacion=(
                            liquidacion
                        ),

                        almacigo=(
                            almacigo
                        ),

                        fecha=(
                            almacigo.fecha
                        ),

                        cantidad=(
                            almacigo.cantidad
                        ),

                        valor_unitario=(
                            almacigo
                            .valor_unitario
                        ),

                        importe=(
                            almacigo.importe
                        ),

                        observacion=(
                            almacigo
                            .observacion
                        ),

                        user_made=(
                            usuario
                        ),
                    )
                )

                # =============================================
                # MARCAR ALMACIGO COMO PAGADO
                # =============================================

                almacigo.estado = (
                    Almacigo
                    .ESTADO_PAGADA
                )

                almacigo.user_updated = (
                    usuario
                )

                almacigo.save()

            # =================================================
            # MOVIMIENTO FINANCIERO
            # =================================================

            crear_movimiento_liquidacion_almacigo(
                liquidacion=liquidacion,
                cuenta=cuenta_financiera,
                usuario=usuario,
            )

        # =====================================================
        # RESPUESTA
        # =====================================================

        resultado = (
            LiquidacionAlmacigoSerializer(
                liquidacion
            )
        )

        return Response(
            resultado.data,
            status=status.HTTP_201_CREATED,
        )
    





# ============================================================
# LIQUIDACION CARPIDAS
# ============================================================


class LiquidacionCarpidaViewSet(
    ReadOnlyModelViewSet
):
    permission_classes = [
        IsAuthenticated,
        EsAdministracion,
    ]

    serializer_class = (
        LiquidacionCarpidaSerializer
    )

    queryset = (
        LiquidacionCarpida.objects
        .filter(
            is_deleted=False,
        )
        .select_related(
            "cuenta_financiera",
        )
        .prefetch_related(
            "detalles",
        )
        .order_by(
            "-fecha_pago",
            "-id",
        )
    )

    # ========================================================
    # PENDIENTES
    # ========================================================

    @action(
        detail=False,
        methods=["get"],
        url_path="pendientes",
    )
    def pendientes(
        self,
        request,
    ):
        serializer = (
            CarpidaPendientesQuerySerializer(
                data=request.query_params
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = (
            serializer.validated_data
        )

        carpidas = (
            JornalCarpida.objects
            .filter(
                is_deleted=False,
                liquidada=False,
                fecha__range=(
                    data["fecha_desde"],
                    data["fecha_hasta"],
                ),
            )
            .exclude(
                detalles_liquidacion__is_deleted=False,
            )
            .order_by(
                "fecha",
                "id",
            )
        )

        items = []

        total = Decimal(
            "0.00"
        )

        for carpida in carpidas:

            total += (
                carpida.importe
            )

            items.append(
                {
                    "id": (
                        carpida.id
                    ),

                    "fecha": (
                        carpida.fecha
                    ),

                    "tipo_jornada": (
                        carpida.tipo_jornada
                    ),

                    "tipo_jornada_display": (
                        carpida
                        .get_tipo_jornada_display()
                    ),

                    "valor_jornal": (
                        carpida.valor_jornal
                    ),

                    "importe": (
                        carpida.importe
                    ),

                    "observacion": (
                        carpida.observacion
                    ),

                    "liquidada": (
                        carpida.liquidada
                    ),
                }
            )

        return Response(
            {
                "fecha_desde": (
                    data[
                        "fecha_desde"
                    ]
                ),

                "fecha_hasta": (
                    data[
                        "fecha_hasta"
                    ]
                ),

                "carpidas": items,

                "resumen": {
                    "cantidad_registros": (
                        len(items)
                    ),

                    "total": (
                        decimal_dos(
                            total
                        )
                    ),
                },
            }
        )

    # ========================================================
    # LIQUIDAR
    # ========================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="liquidar",
    )
    def liquidar(
        self,
        request,
    ):
        serializer = (
            LiquidarCarpidaRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = (
            serializer.validated_data
        )

        ids = data[
            "carpidas"
        ]

        cuenta_financiera = (
            data[
                "cuenta_financiera"
            ]
        )

        usuario = (
            request.user
        )

        with transaction.atomic():

            # =================================================
            # BLOQUEAR Y OBTENER CARPIDAS
            # =================================================

            carpidas = list(
                JornalCarpida.objects
                .select_for_update()
                .filter(
                    id__in=ids,
                    is_deleted=False,
                )
                .order_by(
                    "fecha",
                    "id",
                )
            )

            # =================================================
            # VALIDAR EXISTENCIA
            # =================================================

            if (
                len(carpidas)
                != len(ids)
            ):
                raise ValidationError(
                    {
                        "carpidas": (
                            "Una o más carpidas "
                            "no existen."
                        )
                    }
                )

            total = Decimal(
                "0.00"
            )

            # =================================================
            # VALIDACIONES INDIVIDUALES
            # =================================================

            for carpida in carpidas:

                # ---------------------------------------------
                # PERIODO
                # ---------------------------------------------

                if not (
                    data["fecha_desde"]
                    <= carpida.fecha
                    <= data["fecha_hasta"]
                ):
                    raise ValidationError(
                        {
                            "carpidas": (
                                f"La carpida "
                                f"#{carpida.id} "
                                "está fuera del período "
                                "seleccionado."
                            )
                        }
                    )

                # ---------------------------------------------
                # LIQUIDADA
                # ---------------------------------------------

                if carpida.liquidada:
                    raise ValidationError(
                        {
                            "carpidas": (
                                f"La carpida "
                                f"#{carpida.id} "
                                "ya se encuentra pagada."
                            )
                        }
                    )

                # ---------------------------------------------
                # DETALLE EXISTENTE
                # ---------------------------------------------

                ya_liquidada = (
                    DetalleLiquidacionCarpida
                    .objects
                    .filter(
                        jornal_carpida=carpida,
                        is_deleted=False,
                    )
                    .exists()
                )

                if ya_liquidada:
                    raise ValidationError(
                        {
                            "carpidas": (
                                f"La carpida "
                                f"#{carpida.id} "
                                "ya pertenece a una "
                                "liquidación."
                            )
                        }
                    )

                # ---------------------------------------------
                # VALIDAR IMPORTE
                # ---------------------------------------------

                if (
                    carpida.importe
                    is None
                    or carpida.importe
                    <= Decimal("0.00")
                ):
                    raise ValidationError(
                        {
                            "carpidas": (
                                f"La carpida "
                                f"#{carpida.id} "
                                "no posee un importe "
                                "válido."
                            )
                        }
                    )

                # ---------------------------------------------
                # TOTAL
                # ---------------------------------------------

                total += (
                    carpida.importe
                )

            total = decimal_dos(
                total
            )

            # =================================================
            # CREAR LIQUIDACION
            # =================================================

            liquidacion = (
                LiquidacionCarpida.objects
                .create(
                    fecha_desde=(
                        data[
                            "fecha_desde"
                        ]
                    ),

                    fecha_hasta=(
                        data[
                            "fecha_hasta"
                        ]
                    ),

                    fecha_pago=(
                        data[
                            "fecha_pago"
                        ]
                    ),

                    cuenta_financiera=(
                        cuenta_financiera
                    ),

                    cantidad_carpidas=(
                        len(carpidas)
                    ),

                    total=total,

                    observacion=(
                        data[
                            "observacion"
                        ]
                    ),

                    user_made=(
                        usuario
                    ),
                )
            )

            # =================================================
            # CREAR DETALLES
            # =================================================

            for carpida in carpidas:

                (
                    DetalleLiquidacionCarpida
                    .objects
                    .create(
                        liquidacion=(
                            liquidacion
                        ),

                        jornal_carpida=(
                            carpida
                        ),

                        fecha=(
                            carpida.fecha
                        ),

                        tipo_jornada=(
                            carpida
                            .tipo_jornada
                        ),

                        valor_jornal_aplicado=(
                            carpida
                            .valor_jornal
                        ),

                        importe=(
                            carpida
                            .importe
                        ),

                        observacion=(
                            carpida
                            .observacion
                        ),

                        user_made=(
                            usuario
                        ),
                    )
                )

                # =============================================
                # MARCAR CARPIDA COMO LIQUIDADA
                # =============================================

                carpida.liquidada = True

                carpida.user_updated = (
                    usuario
                )

                carpida.save(
                    update_fields=[
                        "liquidada",
                        "user_updated",
                        "updated_at",
                    ]
                )

            # =================================================
            # MOVIMIENTO FINANCIERO
            # =================================================

            crear_movimiento_liquidacion_carpida(
                liquidacion=liquidacion,
                cuenta=cuenta_financiera,
                usuario=usuario,
            )

        # =====================================================
        # RESPUESTA
        # =====================================================

        resultado = (
            LiquidacionCarpidaSerializer(
                liquidacion
            )
        )

        return Response(
            resultado.data,
            status=(
                status.HTTP_201_CREATED
            ),
        )







# ============================================================
# RENDICIONES DE VENTA
# ============================================================


class RendicionVentaViewSet(
    ReadOnlyModelViewSet
):
    permission_classes = [
        IsAuthenticated,
        EsAdministracion,
    ]

    serializer_class = (
        RendicionVentaSerializer
    )

    queryset = (
        RendicionVenta.objects
        .filter(
            is_deleted=False,
        )
        .select_related(
            "cuenta_financiera",
        )
        .prefetch_related(
            "detalles",
            "detalles__comprador",
            "detalles__venta",
            "detalles__pago_venta",
        )
        .order_by(
            "-fecha",
            "-id",
        )
    )

    # --------------------------------------------------------
    # PAGOS PENDIENTES DE RENDIR
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="pendientes",
    )
    def pendientes(
        self,
        request,
    ):

        serializer = (
            RendicionPendientesQuerySerializer(
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

        pagos = (
            PagoVenta.objects
            .filter(
                is_deleted=False,
            )
            .exclude(
                detalles_rendicion__is_deleted=False,
            )
            .select_related(
                "venta",
                "venta__comprador",
            )
            .order_by(
                "fecha",
                "id",
            )
        )

        fecha_desde = (
            data.get(
                "fecha_desde"
            )
        )

        fecha_hasta = (
            data.get(
                "fecha_hasta"
            )
        )

        if fecha_desde:
            pagos = (
                pagos.filter(
                    fecha__gte=(
                        fecha_desde
                    )
                )
            )

        if fecha_hasta:
            pagos = (
                pagos.filter(
                    fecha__lte=(
                        fecha_hasta
                    )
                )
            )

        items = []

        total = Decimal(
            "0.00"
        )

        for pago in pagos:

            total += (
                pago.importe
            )

            items.append(
                {
                    "id": (
                        pago.id
                    ),

                    "fecha": (
                        pago.fecha
                    ),

                    "venta": (
                        pago.venta_id
                    ),

                    "comprador": {
                        "id": (
                            pago
                            .venta
                            .comprador_id
                        ),

                        "nombre": (
                            pago
                            .venta
                            .comprador
                            .nombre
                        ),
                    },

                    "cantidad_bolsas": (
                        pago
                        .cantidad_bolsas
                    ),

                    "precio_unitario": (
                        pago
                        .venta
                        .precio_unitario
                    ),

                    "importe": (
                        pago.importe
                    ),

                    "observacion": (
                        pago
                        .observacion
                    ),
                }
            )

        return Response(
            {
                "fecha_desde": (
                    fecha_desde
                ),

                "fecha_hasta": (
                    fecha_hasta
                ),

                "pagos": (
                    items
                ),

                "resumen": {
                    "cantidad_pagos": (
                        len(
                            items
                        )
                    ),

                    "total_pendiente_rendir": (
                        decimal_dos(
                            total
                        )
                    ),
                },
            }
        )

    # --------------------------------------------------------
    # RENDIR
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["post"],
        url_path="rendir",
    )
    def rendir(
        self,
        request,
    ):

        serializer = (
            CrearRendicionRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = (
            serializer
            .validated_data
        )

        ids = (
            data[
                "pagos"
            ]
        )

        cuenta_financiera = (
            data[
                "cuenta_financiera"
            ]
        )

        usuario = (
            request.user
        )

        with transaction.atomic():

            # =================================================
            # OBTENER PAGOS
            # =================================================

            pagos = list(
                PagoVenta.objects
                .select_for_update()
                .filter(
                    id__in=ids,
                    is_deleted=False,
                )
                .select_related(
                    "venta",
                    "venta__comprador",
                )
                .order_by(
                    "fecha",
                    "id",
                )
            )

            # =================================================
            # VALIDAR EXISTENCIA
            # =================================================

            if (
                len(pagos)
                != len(ids)
            ):
                raise ValidationError(
                    {
                        "pagos": (
                            "Uno o más pagos "
                            "no existen."
                        )
                    }
                )

            total = Decimal(
                "0.00"
            )

            # =================================================
            # VALIDACIONES
            # =================================================

            for pago in pagos:

                ya_rendido = (
                    DetalleRendicionVenta
                    .objects
                    .filter(
                        pago_venta=pago,
                        is_deleted=False,
                    )
                    .exists()
                )

                if ya_rendido:
                    raise ValidationError(
                        {
                            "pagos": (
                                f"El pago "
                                f"#{pago.id} "
                                "ya fue rendido."
                            )
                        }
                    )

                total += (
                    pago.importe
                )

            total = (
                decimal_dos(
                    total
                )
            )

            # =================================================
            # CREAR RENDICION
            # =================================================

            rendicion = (
                RendicionVenta.objects
                .create(
                    fecha=(
                        data[
                            "fecha"
                        ]
                    ),

                    cuenta_financiera=(
                        cuenta_financiera
                    ),

                    total=(
                        total
                    ),

                    observacion=(
                        data[
                            "observacion"
                        ]
                    ),

                    user_made=(
                        usuario
                    ),
                )
            )

            # =================================================
            # CREAR DETALLES
            # =================================================

            for pago in pagos:

                venta = (
                    pago.venta
                )

                (
                    DetalleRendicionVenta
                    .objects
                    .create(
                        rendicion=(
                            rendicion
                        ),

                        pago_venta=(
                            pago
                        ),

                        venta=(
                            venta
                        ),

                        comprador=(
                            venta
                            .comprador
                        ),

                        fecha_pago=(
                            pago.fecha
                        ),

                        cantidad_bolsas=(
                            pago
                            .cantidad_bolsas
                        ),

                        importe=(
                            pago.importe
                        ),

                        user_made=(
                            usuario
                        ),
                    )
                )

            # =================================================
            # MOVIMIENTO FINANCIERO
            # =================================================

            crear_movimiento_rendicion_venta(
                rendicion=(
                    rendicion
                ),

                cuenta=(
                    cuenta_financiera
                ),

                usuario=(
                    usuario
                ),
            )

        # =====================================================
        # RESPUESTA
        # =====================================================

        resultado = (
            RendicionVentaSerializer(
                rendicion
            )
        )

        return Response(
            resultado.data,
            status=(
                status
                .HTTP_201_CREATED
            ),
        )