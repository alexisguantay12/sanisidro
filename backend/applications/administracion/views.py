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

from applications.finanzas.movimientos_automaticos import (
    crear_movimiento_liquidacion_personal,
    crear_movimiento_liquidacion_tractor,
    crear_movimiento_liquidacion_almacigo,
    crear_movimiento_rendicion_venta
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
)

from applications.administracion.models import (
    DetalleLiquidacionAlmacigo,
    DetalleLiquidacionHoraExtra,
    DetalleLiquidacionTarja,
    DetalleLiquidacionTractor,
    DetalleLiquidacionTarjaExterna,
    DetalleRendicionVenta,
    LiquidacionAlmacigo,
    LiquidacionPersonal,
    LiquidacionTractor,
    RendicionVenta,
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
)





# ============================================================
# FUNCIONES AUXILIARES
# ============================================================


DOS_DECIMALES = Decimal("0.01")


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

        total = (
            total_tarjas
            + total_horas_extra
            -total_descuentos
        )

        return Response(
            {
                "peon": {
                    "id": peon.id,
                    "nombre": peon.nombre,
                },
                "fecha_desde": fecha_desde,
                "fecha_hasta": fecha_hasta,
                "tarjas": tarjas_data,
                "horas_extra": horas_data,
                "tarjas_externas": (
                    tarjas_externas_data
                ),
                "resumen": {
                    "cantidad_tarjas": len(
                        tarjas_data
                    ),
                    "cantidad_horas_extra": len(
                        horas_data
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
                    "total": decimal_dos(
                        total
                    ),
                    "cantidad_tarjas_externas": (
                        len(
                            tarjas_externas_data
                        )
                    ),

                    "total_descuentos": (
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
    def liquidar(self, request):

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

        tarjas_ids = data[
            "tarjas"
        ]

        horas_ids = data[
            "horas_extra"
        ]

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
            # VALIDAR TARJAS NORMALES
            # =====================================================

            total_tarjas = Decimal(
                "0.00"
            )

            datos_tarjas = []

            for tarja in tarjas:

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

                ya_liquidada = (
                    DetalleLiquidacionTarja
                    .objects
                    .filter(
                        tarja=tarja,
                        is_deleted=False,
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
                    * fraccion
                )

                total_tarjas += (
                    importe
                )

                datos_tarjas.append(
                    {
                        "tarja": (
                            tarja
                        ),

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
            # VALIDAR HORAS EXTRA
            # =====================================================

            total_horas = Decimal(
                "0.00"
            )

            for hora in horas:

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

                ya_liquidada = (
                    DetalleLiquidacionHoraExtra
                    .objects
                    .filter(
                        hora_extra=hora,
                        is_deleted=False,
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
            # CALCULAR TARJAS EXTERNAS / DESCUENTOS
            # =====================================================

            total_descuentos = Decimal(
                "0.00"
            )

            datos_descuentos = []

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
                    valor_unitario
                    * fraccion
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
            # TOTALES
            # =====================================================

            total_tarjas = (
                decimal_dos(
                    total_tarjas
                )
            )

            total_horas = (
                decimal_dos(
                    total_horas
                )
            )

            total_descuentos = (
                decimal_dos(
                    total_descuentos
                )
            )

            total = decimal_dos(
                total_tarjas
                + total_horas
                - total_descuentos
            )

            # =====================================================
            # POR AHORA NO PERMITIMOS TOTAL NEGATIVO
            # =====================================================

            if (
                total
                < Decimal("0.00")
            ):
                raise ValidationError(
                    {
                        "total": (
                            "Los jornales a descontar "
                            "superan el total a pagar. "
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
            # CREAR DETALLES TARJAS NORMALES
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
            # CREAR DETALLES DE DESCUENTOS
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
            # CREAR DETALLES HORAS EXTRA
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

                hora.save()

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
                status
                .HTTP_201_CREATED
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