from rest_framework import serializers

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


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================


def validar_ids_unicos(ids):
    if len(ids) != len(set(ids)):
        raise serializers.ValidationError(
            "No se pueden repetir registros."
        )

    return ids


# ============================================================
# SERIALIZERS PARA CONSULTAS / REQUESTS
# ============================================================


class PeriodoSerializer(serializers.Serializer):
    fecha_desde = serializers.DateField()
    fecha_hasta = serializers.DateField()

    def validate(self, attrs):
        fecha_desde = attrs["fecha_desde"]
        fecha_hasta = attrs["fecha_hasta"]

        if fecha_hasta < fecha_desde:
            raise serializers.ValidationError(
                {
                    "fecha_hasta": (
                        "La fecha hasta no puede ser "
                        "anterior a la fecha desde."
                    )
                }
            )

        return attrs


# ============================================================
# PERSONAL - CONSULTA PENDIENTES
# ============================================================


class PersonalPendientesQuerySerializer(
    PeriodoSerializer
):
    peon = serializers.IntegerField(
        min_value=1,
    )


# ============================================================
# PERSONAL - LIQUIDAR
# ============================================================


class LiquidarPersonalRequestSerializer(
    PeriodoSerializer
):
    peon = serializers.IntegerField(
        min_value=1,
    )

    fecha_pago = serializers.DateField()

    tarjas = serializers.ListField(
        child=serializers.IntegerField(
            min_value=1,
        ),
        required=False,
        default=list,
    )

    horas_extra = serializers.ListField(
        child=serializers.IntegerField(
            min_value=1,
        ),
        required=False,
        default=list,
    )

    observacion = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_tarjas(self, value):
        return validar_ids_unicos(value)

    def validate_horas_extra(self, value):
        return validar_ids_unicos(value)

    def validate(self, attrs):
        attrs = super().validate(attrs)

        if (
            not attrs.get("tarjas")
            and not attrs.get("horas_extra")
        ):
            raise serializers.ValidationError(
                (
                    "Debe seleccionar al menos una tarja "
                    "o una hora extra."
                )
            )

        return attrs


# ============================================================
# TRACTOR - CONSULTA
# ============================================================


class TractorPendientesQuerySerializer(
    PeriodoSerializer
):
    tipo = serializers.ChoiceField(
        choices=LiquidacionTractor.TIPOS,
    )

    proveedor = serializers.IntegerField(
        min_value=1,
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        attrs = super().validate(attrs)

        tipo = attrs["tipo"]
        proveedor = attrs.get("proveedor")

        if (
            tipo == LiquidacionTractor.TIPO_SERGIO
            and proveedor
        ):
            raise serializers.ValidationError(
                {
                    "proveedor": (
                        "Sergio no debe tener proveedor."
                    )
                }
            )

        if (
            tipo == LiquidacionTractor.TIPO_TERCERO
            and not proveedor
        ):
            raise serializers.ValidationError(
                {
                    "proveedor": (
                        "Debe seleccionar un proveedor."
                    )
                }
            )

        return attrs


# ============================================================
# TRACTOR - LIQUIDAR
# ============================================================


class LiquidarTractorRequestSerializer(
    TractorPendientesQuerySerializer
):
    fecha_pago = serializers.DateField()

    trabajos = serializers.ListField(
        child=serializers.IntegerField(
            min_value=1,
        ),
        min_length=1,
    )

    observacion = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_trabajos(self, value):
        return validar_ids_unicos(value)


# ============================================================
# ALMACIGOS - CONSULTA
# ============================================================


class AlmacigoPendientesQuerySerializer(
    PeriodoSerializer
):
    pass


# ============================================================
# ALMACIGOS - LIQUIDAR
# ============================================================


class LiquidarAlmacigoRequestSerializer(
    PeriodoSerializer
):
    fecha_pago = serializers.DateField()

    almacigos = serializers.ListField(
        child=serializers.IntegerField(
            min_value=1,
        ),
        min_length=1,
    )

    observacion = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_almacigos(self, value):
        return validar_ids_unicos(value)


# ============================================================
# RENDICIONES - CONSULTA
# ============================================================


class RendicionPendientesQuerySerializer(
    serializers.Serializer
):
    fecha_desde = serializers.DateField(
        required=False,
    )

    fecha_hasta = serializers.DateField(
        required=False,
    )

    def validate(self, attrs):
        fecha_desde = attrs.get(
            "fecha_desde"
        )

        fecha_hasta = attrs.get(
            "fecha_hasta"
        )

        if (
            fecha_desde
            and fecha_hasta
            and fecha_hasta < fecha_desde
        ):
            raise serializers.ValidationError(
                {
                    "fecha_hasta": (
                        "La fecha hasta no puede ser "
                        "anterior a la fecha desde."
                    )
                }
            )

        return attrs


# ============================================================
# RENDICIONES - CREAR
# ============================================================


class CrearRendicionRequestSerializer(
    serializers.Serializer
):
    fecha = serializers.DateField()

    pagos = serializers.ListField(
        child=serializers.IntegerField(
            min_value=1,
        ),
        min_length=1,
    )

    observacion = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_pagos(self, value):
        return validar_ids_unicos(value)


# ============================================================
# DETALLE LIQUIDACION TARJA
# ============================================================


class DetalleLiquidacionTarjaSerializer(
    serializers.ModelSerializer
):
    tarea_display = serializers.CharField(
        source="tarja.get_tarea_display",
        read_only=True,
    )

    class Meta:
        model = DetalleLiquidacionTarja

        fields = [
            "id",
            "tarja",
            "fecha",
            "fraccion",
            "valor_jornal_aplicado",
            "importe",
            "tarea",
            "tarea_display",
            "observacion",
        ]


# ============================================================
# DETALLE HORA EXTRA
# ============================================================


class DetalleLiquidacionHoraExtraSerializer(
    serializers.ModelSerializer
):
    motivo_display = serializers.CharField(
        source="hora_extra.get_motivo_display",
        read_only=True,
    )

    class Meta:
        model = DetalleLiquidacionHoraExtra

        fields = [
            "id",
            "hora_extra",
            "fecha",
            "cantidad_horas",
            "motivo",
            "motivo_display",
            "valor_jornal_aplicado",
            "valor_hora",
            "importe",
        ]


# ============================================================
# LIQUIDACION PERSONAL
# ============================================================


class LiquidacionPersonalSerializer(
    serializers.ModelSerializer
):
    peon_nombre = serializers.CharField(
        source="peon.nombre",
        read_only=True,
    )

    detalles_tarjas = (
        DetalleLiquidacionTarjaSerializer(
            many=True,
            read_only=True,
        )
    )

    detalles_horas_extra = (
        DetalleLiquidacionHoraExtraSerializer(
            many=True,
            read_only=True,
        )
    )

    class Meta:
        model = LiquidacionPersonal

        fields = [
            "id",
            "peon",
            "peon_nombre",
            "fecha_desde",
            "fecha_hasta",
            "fecha_pago",
            "total_tarjas",
            "total_horas_extra",
            "total",
            "observacion",
            "detalles_tarjas",
            "detalles_horas_extra",
        ]


# ============================================================
# DETALLE TRACTOR
# ============================================================


class DetalleLiquidacionTractorSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = DetalleLiquidacionTractor

        fields = [
            "id",
            "tractor_sergio",
            "tractor_tercero",
            "fecha",
            "cantidad_horas",
            "valor_hora",
            "importe",
            "observacion",
        ]


# ============================================================
# LIQUIDACION TRACTOR
# ============================================================


class LiquidacionTractorSerializer(
    serializers.ModelSerializer
):
    tipo_display = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )

    proveedor_nombre = serializers.CharField(
        source="proveedor.nombre",
        read_only=True,
        allow_null=True,
    )

    detalles = DetalleLiquidacionTractorSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = LiquidacionTractor

        fields = [
            "id",
            "tipo",
            "tipo_display",
            "proveedor",
            "proveedor_nombre",
            "fecha_desde",
            "fecha_hasta",
            "fecha_pago",
            "total_horas",
            "total",
            "observacion",
            "detalles",
        ]


# ============================================================
# DETALLE ALMACIGO
# ============================================================


class DetalleLiquidacionAlmacigoSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = DetalleLiquidacionAlmacigo

        fields = [
            "id",
            "almacigo",
            "fecha",
            "cantidad",
            "valor_unitario",
            "importe",
            "observacion",
        ]


# ============================================================
# LIQUIDACION ALMACIGO
# ============================================================


class LiquidacionAlmacigoSerializer(
    serializers.ModelSerializer
):
    detalles = (
        DetalleLiquidacionAlmacigoSerializer(
            many=True,
            read_only=True,
        )
    )

    class Meta:
        model = LiquidacionAlmacigo

        fields = [
            "id",
            "fecha_desde",
            "fecha_hasta",
            "fecha_pago",
            "cantidad_total",
            "total",
            "observacion",
            "detalles",
        ]


# ============================================================
# DETALLE RENDICION
# ============================================================


class DetalleRendicionVentaSerializer(
    serializers.ModelSerializer
):
    comprador_nombre = serializers.CharField(
        source="comprador.nombre",
        read_only=True,
    )

    class Meta:
        model = DetalleRendicionVenta

        fields = [
            "id",
            "pago_venta",
            "venta",
            "comprador",
            "comprador_nombre",
            "fecha_pago",
            "cantidad_bolsas",
            "importe",
        ]


# ============================================================
# RENDICION
# ============================================================


class RendicionVentaSerializer(
    serializers.ModelSerializer
):
    detalles = DetalleRendicionVentaSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = RendicionVenta

        fields = [
            "id",
            "fecha",
            "total",
            "observacion",
            "detalles",
        ]