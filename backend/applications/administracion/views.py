from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet

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
)

from applications.administracion.models import (
    DetalleLiquidacionAlmacigo,
    DetalleLiquidacionHoraExtra,
    DetalleLiquidacionTarja,
    DetalleLiquidacionTractor,
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


class LiquidacionPersonalViewSet(
    ReadOnlyModelViewSet
):
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
            valor_jornal = obtener_valor_jornal(
                tarja.fecha
            )

            fraccion = Decimal(
                str(tarja.fraccion)
            )

            importe = decimal_dos(
                fraccion
                * valor_jornal.valor
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
                        valor_jornal.valor
                    ),
                    "importe": importe,
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

        peon = get_object_or_404(
            Peon.objects.filter(
                is_deleted=False,
            ),
            pk=data["peon"],
        )

        fecha_desde = data["fecha_desde"]
        fecha_hasta = data["fecha_hasta"]

        tarjas_ids = data["tarjas"]
        horas_ids = data["horas_extra"]

        with transaction.atomic():

            # =================================================
            # TARJAS
            # =================================================

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

            if len(tarjas) != len(
                tarjas_ids
            ):
                raise ValidationError(
                    {
                        "tarjas": (
                            "Una o más tarjas "
                            "no existen."
                        )
                    }
                )

            # =================================================
            # HORAS EXTRA
            # =================================================

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

            if len(horas) != len(
                horas_ids
            ):
                raise ValidationError(
                    {
                        "horas_extra": (
                            "Una o más horas extra "
                            "no existen."
                        )
                    }
                )

            # =================================================
            # VALIDAR TARJAS
            # =================================================

            total_tarjas = Decimal("0.00")

            datos_tarjas = []

            for tarja in tarjas:

                if tarja.peon_id != peon.id:
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

                valor_jornal = (
                    obtener_valor_jornal(
                        tarja.fecha
                    )
                )

                fraccion = Decimal(
                    str(tarja.fraccion)
                )

                importe = decimal_dos(
                    valor_jornal.valor
                    * fraccion
                )

                total_tarjas += importe

                datos_tarjas.append(
                    {
                        "tarja": tarja,
                        "valor_jornal": (
                            valor_jornal.valor
                        ),
                        "fraccion": fraccion,
                        "importe": importe,
                    }
                )

            # =================================================
            # VALIDAR HORAS EXTRA
            # =================================================

            total_horas = Decimal("0.00")

            for hora in horas:

                if hora.peon_id != peon.id:
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
                    != HoraExtra.Estado.PENDIENTE
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

                total_horas += hora.total

            total_tarjas = decimal_dos(
                total_tarjas
            )

            total_horas = decimal_dos(
                total_horas
            )

            total = decimal_dos(
                total_tarjas
                + total_horas
            )

            # =================================================
            # CREAR CABECERA
            # =================================================

            liquidacion = (
                LiquidacionPersonal.objects.create(
                    peon=peon,
                    fecha_desde=fecha_desde,
                    fecha_hasta=fecha_hasta,
                    fecha_pago=data[
                        "fecha_pago"
                    ],
                    total_tarjas=total_tarjas,
                    total_horas_extra=(
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
            # CREAR DETALLES TARJAS
            # =================================================

            for item in datos_tarjas:
                tarja = item["tarja"]

                DetalleLiquidacionTarja.objects.create(
                    liquidacion=liquidacion,
                    tarja=tarja,
                    fecha=tarja.fecha,
                    fraccion=item[
                        "fraccion"
                    ],
                    valor_jornal_aplicado=(
                        item[
                            "valor_jornal"
                        ]
                    ),
                    importe=item[
                        "importe"
                    ],
                    tarea=tarja.tarea,
                    observacion=(
                        tarja.observacion
                    ),
                    user_made=usuario,
                )

            # =================================================
            # CREAR DETALLES HORAS EXTRA
            # =================================================

            for hora in horas:

                DetalleLiquidacionHoraExtra.objects.create(
                    liquidacion=liquidacion,
                    hora_extra=hora,
                    fecha=hora.fecha,
                    cantidad_horas=(
                        hora.cantidad_horas
                    ),
                    motivo=hora.motivo,
                    valor_jornal_aplicado=(
                        hora.valor_jornal_aplicado
                    ),
                    valor_hora=(
                        hora.valor_hora
                    ),
                    importe=hora.total,
                    user_made=usuario,
                )

                hora.estado = (
                    HoraExtra.Estado.LIQUIDADA
                )

                hora.user_updated = usuario

                hora.save()

        resultado = (
            LiquidacionPersonalSerializer(
                liquidacion
            )
        )

        return Response(
            resultado.data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# LIQUIDACION TRACTOR
# ============================================================


class LiquidacionTractorViewSet(
    ReadOnlyModelViewSet
):
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
        fecha_desde = data["fecha_desde"]
        fecha_hasta = data["fecha_hasta"]

        trabajos_data = []

        total_horas = Decimal("0.00")
        total = Decimal("0.00")

        proveedor = None

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
                        "fecha": trabajo.fecha,
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
                        "fecha": trabajo.fecha,
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
                        "nombre": proveedor.nombre,
                    }
                    if proveedor
                    else None
                ),
                "fecha_desde": fecha_desde,
                "fecha_hasta": fecha_hasta,
                "trabajos": trabajos_data,
                "resumen": {
                    "cantidad_trabajos": len(
                        trabajos_data
                    ),
                    "total_horas": (
                        decimal_dos(
                            total_horas
                        )
                    ),
                    "total": decimal_dos(
                        total
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

        fecha_desde = data["fecha_desde"]
        fecha_hasta = data["fecha_hasta"]

        usuario = request.user

        proveedor = None

        with transaction.atomic():

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

            if len(trabajos) != len(ids):
                raise ValidationError(
                    {
                        "trabajos": (
                            "Uno o más trabajos "
                            "no existen."
                        )
                    }
                )

            total_horas = Decimal("0.00")
            total = Decimal("0.00")

            for trabajo in trabajos:

                if not (
                    fecha_desde
                    <= trabajo.fecha
                    <= fecha_hasta
                ):
                    raise ValidationError(
                        {
                            "trabajos": (
                                f"El trabajo "
                                f"#{trabajo.id} está "
                                "fuera del período."
                            )
                        }
                    )

                if (
                    trabajo.estado
                    != trabajo.ESTADO_PENDIENTE
                ):
                    raise ValidationError(
                        {
                            "trabajos": (
                                f"El trabajo "
                                f"#{trabajo.id} ya "
                                "no está pendiente."
                            )
                        }
                    )

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

                if (
                    DetalleLiquidacionTractor
                    .objects
                    .filter(**filtro)
                    .exists()
                ):
                    raise ValidationError(
                        {
                            "trabajos": (
                                f"El trabajo "
                                f"#{trabajo.id} "
                                "ya fue liquidado."
                            )
                        }
                    )

                total_horas += (
                    trabajo.cantidad_horas
                )

                total += trabajo.importe

            total_horas = decimal_dos(
                total_horas
            )

            total = decimal_dos(total)

            liquidacion = (
                LiquidacionTractor.objects.create(
                    tipo=tipo,
                    proveedor=proveedor,
                    fecha_desde=fecha_desde,
                    fecha_hasta=fecha_hasta,
                    fecha_pago=data[
                        "fecha_pago"
                    ],
                    total_horas=total_horas,
                    total=total,
                    observacion=data[
                        "observacion"
                    ],
                    user_made=usuario,
                )
            )

            for trabajo in trabajos:

                if (
                    tipo
                    == LiquidacionTractor
                    .TIPO_SERGIO
                ):
                    valor_hora = (
                        trabajo.valor_hora
                    )

                    tractor_sergio = trabajo
                    tractor_tercero = None

                else:
                    valor_hora = (
                        trabajo.precio_hora
                    )

                    tractor_sergio = None
                    tractor_tercero = trabajo

                DetalleLiquidacionTractor.objects.create(
                    liquidacion=liquidacion,
                    tractor_sergio=(
                        tractor_sergio
                    ),
                    tractor_tercero=(
                        tractor_tercero
                    ),
                    fecha=trabajo.fecha,
                    cantidad_horas=(
                        trabajo.cantidad_horas
                    ),
                    valor_hora=valor_hora,
                    importe=trabajo.importe,
                    observacion=(
                        trabajo.observacion
                    ),
                    user_made=usuario,
                )

                trabajo.estado = (
                    trabajo.ESTADO_PAGADA
                )

                trabajo.user_updated = usuario

                trabajo.save()

        return Response(
            LiquidacionTractorSerializer(
                liquidacion
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# LIQUIDACION ALMACIGOS
# ============================================================


class LiquidacionAlmacigoViewSet(
    ReadOnlyModelViewSet
):
    serializer_class = (
        LiquidacionAlmacigoSerializer
    )

    queryset = (
        LiquidacionAlmacigo.objects
        .filter(
            is_deleted=False,
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
                    Almacigo.ESTADO_PENDIENTE
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
        total = Decimal("0.00")

        for almacigo in almacigos:

            cantidad_total += (
                almacigo.cantidad
            )

            total += almacigo.importe

            items.append(
                {
                    "id": almacigo.id,
                    "fecha": almacigo.fecha,
                    "cantidad": (
                        almacigo.cantidad
                    ),
                    "valor_unitario": (
                        almacigo.valor_unitario
                    ),
                    "importe": (
                        almacigo.importe
                    ),
                    "observacion": (
                        almacigo.observacion
                    ),
                }
            )

        return Response(
            {
                "fecha_desde": data[
                    "fecha_desde"
                ],
                "fecha_hasta": data[
                    "fecha_hasta"
                ],
                "almacigos": items,
                "resumen": {
                    "cantidad_registros": len(
                        items
                    ),
                    "cantidad_total": (
                        cantidad_total
                    ),
                    "total": decimal_dos(
                        total
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

        ids = data["almacigos"]

        usuario = request.user

        with transaction.atomic():

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

            if len(almacigos) != len(ids):
                raise ValidationError(
                    {
                        "almacigos": (
                            "Uno o más almácigos "
                            "no existen."
                        )
                    }
                )

            cantidad_total = 0
            total = Decimal("0.00")

            for almacigo in almacigos:

                if not (
                    data["fecha_desde"]
                    <= almacigo.fecha
                    <= data["fecha_hasta"]
                ):
                    raise ValidationError(
                        {
                            "almacigos": (
                                f"El almácigo "
                                f"#{almacigo.id} está "
                                "fuera del período."
                            )
                        }
                    )

                if (
                    almacigo.estado
                    != Almacigo.ESTADO_PENDIENTE
                ):
                    raise ValidationError(
                        {
                            "almacigos": (
                                f"El almácigo "
                                f"#{almacigo.id} ya "
                                "no está pendiente."
                            )
                        }
                    )

                if (
                    DetalleLiquidacionAlmacigo
                    .objects
                    .filter(
                        almacigo=almacigo,
                        is_deleted=False,
                    )
                    .exists()
                ):
                    raise ValidationError(
                        {
                            "almacigos": (
                                f"El almácigo "
                                f"#{almacigo.id} ya "
                                "fue liquidado."
                            )
                        }
                    )

                cantidad_total += (
                    almacigo.cantidad
                )

                total += almacigo.importe

            total = decimal_dos(total)

            liquidacion = (
                LiquidacionAlmacigo.objects.create(
                    fecha_desde=data[
                        "fecha_desde"
                    ],
                    fecha_hasta=data[
                        "fecha_hasta"
                    ],
                    fecha_pago=data[
                        "fecha_pago"
                    ],
                    cantidad_total=(
                        cantidad_total
                    ),
                    total=total,
                    observacion=data[
                        "observacion"
                    ],
                    user_made=usuario,
                )
            )

            for almacigo in almacigos:

                DetalleLiquidacionAlmacigo.objects.create(
                    liquidacion=liquidacion,
                    almacigo=almacigo,
                    fecha=almacigo.fecha,
                    cantidad=(
                        almacigo.cantidad
                    ),
                    valor_unitario=(
                        almacigo.valor_unitario
                    ),
                    importe=(
                        almacigo.importe
                    ),
                    observacion=(
                        almacigo.observacion
                    ),
                    user_made=usuario,
                )

                almacigo.estado = (
                    Almacigo.ESTADO_PAGADA
                )

                almacigo.user_updated = usuario

                almacigo.save()

        return Response(
            LiquidacionAlmacigoSerializer(
                liquidacion
            ).data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# RENDICIONES DE VENTA
# ============================================================


class RendicionVentaViewSet(
    ReadOnlyModelViewSet
):
    serializer_class = RendicionVentaSerializer

    queryset = (
        RendicionVenta.objects
        .filter(
            is_deleted=False,
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
    def pendientes(self, request):

        serializer = (
            RendicionPendientesQuerySerializer(
                data=request.query_params
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

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

        fecha_desde = data.get(
            "fecha_desde"
        )

        fecha_hasta = data.get(
            "fecha_hasta"
        )

        if fecha_desde:
            pagos = pagos.filter(
                fecha__gte=fecha_desde
            )

        if fecha_hasta:
            pagos = pagos.filter(
                fecha__lte=fecha_hasta
            )

        items = []

        total = Decimal("0.00")

        for pago in pagos:

            total += pago.importe

            items.append(
                {
                    "id": pago.id,
                    "fecha": pago.fecha,
                    "venta": pago.venta_id,
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
                        pago.cantidad_bolsas
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
                        pago.observacion
                    ),
                }
            )

        return Response(
            {
                "fecha_desde": fecha_desde,
                "fecha_hasta": fecha_hasta,
                "pagos": items,
                "resumen": {
                    "cantidad_pagos": len(
                        items
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
    def rendir(self, request):

        serializer = (
            CrearRendicionRequestSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        ids = data["pagos"]

        usuario = request.user

        with transaction.atomic():

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

            if len(pagos) != len(ids):
                raise ValidationError(
                    {
                        "pagos": (
                            "Uno o más pagos "
                            "no existen."
                        )
                    }
                )

            total = Decimal("0.00")

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
                                f"#{pago.id} ya "
                                "fue rendido."
                            )
                        }
                    )

                total += pago.importe

            total = decimal_dos(total)

            rendicion = (
                RendicionVenta.objects.create(
                    fecha=data["fecha"],
                    total=total,
                    observacion=data[
                        "observacion"
                    ],
                    user_made=usuario,
                )
            )

            for pago in pagos:

                venta = pago.venta

                DetalleRendicionVenta.objects.create(
                    rendicion=rendicion,
                    pago_venta=pago,
                    venta=venta,
                    comprador=(
                        venta.comprador
                    ),
                    fecha_pago=(
                        pago.fecha
                    ),
                    cantidad_bolsas=(
                        pago.cantidad_bolsas
                    ),
                    importe=(
                        pago.importe
                    ),
                    user_made=usuario,
                )

        return Response(
            RendicionVentaSerializer(
                rendicion
            ).data,
            status=status.HTTP_201_CREATED,
        )