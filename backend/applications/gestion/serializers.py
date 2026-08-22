from rest_framework import serializers

from .models import Peon, Tarja, HoraExtra, ValorJornal


class PeonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Peon

        fields = [
            "id",
            "nombre",
            "activo",
            "created_at",
            "updated_at",
            "user_made",
            "user_updated",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "user_made",
            "user_updated",
        ]


class TarjaSerializer(
    serializers.ModelSerializer
):
    peon_nombre = serializers.CharField(
        source="peon.nombre",
        read_only=True,
    )

    fraccion_display = (
        serializers.CharField(
            source="get_fraccion_display",
            read_only=True,
        )
    )

    tarea_display = (
        serializers.CharField(
            source="get_tarea_display",
            read_only=True,
        )
    )

    destino_display = (
        serializers.CharField(
            source="get_destino_display",
            read_only=True,
        )
    )

    destinatario_nombre = (
        serializers.CharField(
            source="destinatario.nombre",
            read_only=True,
            allow_null=True,
        )
    )

    class Meta:
        model = Tarja

        fields = [
            "id",

            "peon",
            "peon_nombre",

            "fecha",

            "fraccion",
            "fraccion_display",

            "tarea",
            "tarea_display",

            "destino",
            "destino_display",

            "destinatario",
            "destinatario_nombre",

            "observacion",
        ]

    def validate(self, attrs):
        instance = self.instance

        peon = attrs.get(
            "peon",
            getattr(
                instance,
                "peon",
                None,
            ),
        )

        destino = attrs.get(
            "destino",
            getattr(
                instance,
                "destino",
                Tarja.Destino.SAN_ISIDRO,
            ),
        )

        destinatario = attrs.get(
            "destinatario",
            getattr(
                instance,
                "destinatario",
                None,
            ),
        )

        # --------------------------------------------
        # SAN ISIDRO
        # --------------------------------------------

        if (
            destino
            == Tarja.Destino.SAN_ISIDRO
        ):
            attrs["destinatario"] = None

        # --------------------------------------------
        # EXTERNO
        # --------------------------------------------

        if (
            destino
            == Tarja.Destino.EXTERNO
        ):
            if not destinatario:
                raise serializers.ValidationError({
                    "destinatario": (
                        "Debe seleccionar "
                        "un destinatario."
                    )
                })

            if (
                peon
                and destinatario.id
                == peon.id
            ):
                raise serializers.ValidationError({
                    "destinatario": (
                        "El peón no puede "
                        "trabajar para sí mismo."
                    )
                })

            if (
                destinatario.is_deleted
                or not destinatario.activo
            ):
                raise serializers.ValidationError({
                    "destinatario": (
                        "El destinatario "
                        "seleccionado no está activo."
                    )
                })

        return attrs
    
    


class ValorJornalSerializer(serializers.ModelSerializer):

    class Meta:
        model = ValorJornal
        fields = [
            "id",
            "valor",
            "vigente_desde",
            "activo",
        ]


class HoraExtraSerializer(serializers.ModelSerializer):

    peon_nombre = serializers.CharField(
        source="peon.nombre",
        read_only=True,
    )

    motivo_display = serializers.CharField(
        source="get_motivo_display",
        read_only=True,
    )

    estado_display = serializers.CharField(
        source="get_estado_display",
        read_only=True,
    )

    class Meta:
        model = HoraExtra

        fields = [
            "id",
            "peon",
            "peon_nombre",
            "fecha",
            "cantidad_horas",
            "motivo",
            "motivo_display",
            "estado",
            "estado_display",
            "valor_jornal_aplicado",
            "valor_hora",
            "total",
        ]

        read_only_fields = [
            "estado",
            "valor_jornal_aplicado",
            "valor_hora",
            "total",
        ]


from rest_framework import serializers

from .models import (
    ConfiguracionTractor,
    Proveedor,
    TractorSergio,
    TractorTercero,
)


# ============================================================
# PROVEEDOR
# ============================================================


class ProveedorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Proveedor

        fields = [
            "id",
            "nombre",
            "observacion",
            "activo",
        ]

        read_only_fields = [
            "id",
        ]

    def validate_nombre(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "El nombre del proveedor es obligatorio."
            )

        return value

    def create(self, validated_data):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            validated_data["user_made"] = request.user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            validated_data["user_updated"] = request.user

        return super().update(
            instance,
            validated_data,
        )


# ============================================================
# CONFIGURACION TRACTOR
# ============================================================


class ConfiguracionTractorSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ConfiguracionTractor

        fields = [
            "id",
            "valor_hora_sergio",
        ]

        read_only_fields = [
            "id",
        ]

    def create(self, validated_data):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            validated_data["user_made"] = request.user

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            validated_data["user_updated"] = request.user

        return super().update(
            instance,
            validated_data,
        )


# ============================================================
# TRACTOR SERGIO
# ============================================================


class TractorSergioSerializer(
    serializers.ModelSerializer
):

    estado_display = serializers.CharField(
        source="get_estado_display",
        read_only=True,
    )

    puede_editar = serializers.SerializerMethodField()
    puede_eliminar = serializers.SerializerMethodField()

    class Meta:
        model = TractorSergio

        fields = [
            "id",
            "fecha",
            "cantidad_horas",
            "valor_hora",
            "importe",
            "observacion",
            "estado",
            "estado_display",
            "puede_editar",
            "puede_eliminar",
        ]

        read_only_fields = [
            "id",
            "valor_hora",
            "importe",
            "estado",
            "estado_display",
            "puede_editar",
            "puede_eliminar",
        ]

    def get_puede_editar(self, obj):
        return (
            obj.estado
            == TractorSergio.ESTADO_PENDIENTE
        )

    def get_puede_eliminar(self, obj):
        return (
            obj.estado
            == TractorSergio.ESTADO_PENDIENTE
        )

    def validate(self, attrs):

        if not self.instance:
            return attrs

        if (
            self.instance.estado
            != TractorSergio.ESTADO_PENDIENTE
        ):
            raise serializers.ValidationError(
                "No se puede editar un registro pagado."
            )

        return attrs

    def create(self, validated_data):

        request = self.context.get("request")

        configuracion = (
            ConfiguracionTractor.objects
            .filter(
                is_deleted=False,
            )
            .order_by("-id")
            .first()
        )

        if not configuracion:
            raise serializers.ValidationError(
                {
                    "detail": (
                        "Debe configurar primero "
                        "el valor de la hora de Sergio."
                    )
                }
            )

        validated_data["valor_hora"] = (
            configuracion.valor_hora_sergio
        )

        validated_data["estado"] = (
            TractorSergio.ESTADO_PENDIENTE
        )

        if request and request.user.is_authenticated:
            validated_data["user_made"] = request.user

        return super().create(validated_data)

    def update(
        self,
        instance,
        validated_data,
    ):

        request = self.context.get("request")

        # ÚNICAMENTE ESTOS CAMPOS
        instance.cantidad_horas = (
            validated_data.get(
                "cantidad_horas",
                instance.cantidad_horas,
            )
        )

        instance.observacion = (
            validated_data.get(
                "observacion",
                instance.observacion,
            )
        )

        if request and request.user.is_authenticated:
            instance.user_updated = request.user

        instance.full_clean()
        instance.save()

        return instance


# ============================================================
# TRACTOR TERCERO
# ============================================================


class TractorTerceroSerializer(
    serializers.ModelSerializer
):

    proveedor_nombre = serializers.CharField(
        source="proveedor.nombre",
        read_only=True,
    )

    estado_display = serializers.CharField(
        source="get_estado_display",
        read_only=True,
    )

    puede_editar = serializers.SerializerMethodField()
    puede_eliminar = serializers.SerializerMethodField()

    proveedor = serializers.PrimaryKeyRelatedField(
        queryset=Proveedor.objects.filter(
            is_deleted=False,
            activo=True,
        )
    )

    class Meta:
        model = TractorTercero

        fields = [
            "id",
            "fecha",
            "proveedor",
            "proveedor_nombre",
            "cantidad_horas",
            "precio_hora",
            "importe",
            "observacion",
            "estado",
            "estado_display",
            "puede_editar",
            "puede_eliminar",
        ]

        read_only_fields = [
            "id",
            "proveedor_nombre",
            "importe",
            "estado",
            "estado_display",
            "puede_editar",
            "puede_eliminar",
        ]

    def get_puede_editar(self, obj):
        return (
            obj.estado
            == TractorTercero.ESTADO_PENDIENTE
        )

    def get_puede_eliminar(self, obj):
        return (
            obj.estado
            == TractorTercero.ESTADO_PENDIENTE
        )

    def validate(self, attrs):

        if not self.instance:
            return attrs

        if (
            self.instance.estado
            != TractorTercero.ESTADO_PENDIENTE
        ):
            raise serializers.ValidationError(
                "No se puede editar un registro pagado."
            )

        return attrs

    def create(self, validated_data):

        request = self.context.get("request")

        validated_data["estado"] = (
            TractorTercero.ESTADO_PENDIENTE
        )

        if request and request.user.is_authenticated:
            validated_data["user_made"] = request.user

        return super().create(validated_data)

    def update(
        self,
        instance,
        validated_data,
    ):

        request = self.context.get("request")

        # ÚNICAMENTE ESTOS CAMPOS
        instance.proveedor = (
            validated_data.get(
                "proveedor",
                instance.proveedor,
            )
        )

        instance.cantidad_horas = (
            validated_data.get(
                "cantidad_horas",
                instance.cantidad_horas,
            )
        )

        instance.precio_hora = (
            validated_data.get(
                "precio_hora",
                instance.precio_hora,
            )
        )

        instance.observacion = (
            validated_data.get(
                "observacion",
                instance.observacion,
            )
        )

        if request and request.user.is_authenticated:
            instance.user_updated = request.user

        instance.full_clean()
        instance.save()

        return instance




from .models import Insumo, ConsumoInsumo


class InsumoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )

    class Meta:
        model = Insumo
        fields = [
            "id",
            "nombre",
            "tipo",
            "tipo_display",
            "observacion",
        ]


class ConsumoInsumoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.CharField(
        source="insumo.nombre",
        read_only=True,
    )

    insumo_tipo = serializers.CharField(
        source="insumo.tipo",
        read_only=True,
    )

    insumo_tipo_display = serializers.CharField(
        source="insumo.get_tipo_display",
        read_only=True,
    )

    unidad_display = serializers.CharField(
        source="get_unidad_display",
        read_only=True,
    )

    class Meta:
        model = ConsumoInsumo
        fields = [
            "id",
            "fecha_aplicacion",
            "insumo",
            "insumo_nombre",
            "insumo_tipo",
            "insumo_tipo_display",
            "cantidad",
            "unidad",
            "unidad_display",
            "observacion",
        ]




from rest_framework import serializers

from .models import (
    Proveedor,
    Insumo,
    ValorJornal,
    ConfiguracionTractor,
)


# ============================================================
# PROVEEDOR
# ============================================================


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor

        fields = [
            "id",
            "nombre",
            "observacion",
            "activo",
        ]

        read_only_fields = [
            "id",
        ]


# ============================================================
# INSUMO
# ============================================================


class InsumoSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )

    class Meta:
        model = Insumo

        fields = [
            "id",
            "nombre",
            "tipo",
            "tipo_display",
            "observacion",
        ]

        read_only_fields = [
            "id",
            "tipo_display",
        ]


# ============================================================
# VALOR JORNAL
# ============================================================


class ValorJornalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValorJornal

        fields = [
            "id",
            "valor",
            "vigente_desde",
            "activo",
        ]

        read_only_fields = [
            "id",
            "activo",
        ]


# ============================================================
# CONFIGURACION TRACTOR
# ============================================================


class ConfiguracionTractorSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ConfiguracionTractor

        fields = [
            "id",
            "valor_hora_sergio",
        ]

        read_only_fields = [
            "id",
        ]


from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers


class CambiarPasswordSerializer(
    serializers.Serializer
):
    password_actual = (
        serializers.CharField(
            write_only=True
        )
    )

    password_nueva = (
        serializers.CharField(
            write_only=True
        )
    )

    password_nueva_confirmacion = (
        serializers.CharField(
            write_only=True
        )
    )


    def validate(
        self,
        attrs,
    ):
        request = (
            self.context[
                "request"
            ]
        )

        user = request.user


        password_actual = (
            attrs[
                "password_actual"
            ]
        )

        password_nueva = (
            attrs[
                "password_nueva"
            ]
        )

        confirmacion = (
            attrs[
                "password_nueva_confirmacion"
            ]
        )


        # Contraseña actual
        if not user.check_password(
            password_actual
        ):
            raise serializers.ValidationError({
                "password_actual": (
                    "La contraseña actual "
                    "es incorrecta."
                )
            })


        # Confirmación
        if (
            password_nueva
            != confirmacion
        ):
            raise serializers.ValidationError({
                "password_nueva_confirmacion": (
                    "Las contraseñas "
                    "no coinciden."
                )
            })


        # Evitar poner la misma
        if user.check_password(
            password_nueva
        ):
            raise serializers.ValidationError({
                "password_nueva": (
                    "La nueva contraseña "
                    "debe ser diferente "
                    "a la actual."
                )
            })


        # Validadores de Django
        validate_password(
            password_nueva,
            user=user,
        )


        return attrs


from decimal import Decimal

from rest_framework import serializers

from .models import (
    Almacigo,
    ConfiguracionAlmacigo,
)


class ConfiguracionAlmacigoSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ConfiguracionAlmacigo
        fields = [
            "id",
            "valor",
        ]

        read_only_fields = [
            "id",
        ]

    def validate_valor(
        self,
        value,
    ):
        if value <= 0:
            raise serializers.ValidationError(
                "El valor debe ser mayor a cero."
            )

        return value

class AlmacigoSerializer(
    serializers.ModelSerializer
):
    estado_display = serializers.CharField(
        source="get_estado_display",
        read_only=True,
    )

    class Meta:
        model = Almacigo

        fields = [
            "id",
            "fecha",
            "cantidad",
            "observacion",
            "valor_unitario",
            "importe",
            "estado",
            "estado_display",
        ]

        read_only_fields = [
            "id",
            "valor_unitario",
            "importe",
            "estado",
            "estado_display",
        ]


    def validate_cantidad(
        self,
        value,
    ):
        if value < 1:
            raise serializers.ValidationError(
                "La cantidad debe ser mayor o igual a 1."
            )

        return value


    def validate(
        self,
        attrs,
    ):
        if (
            self.instance
            and
            self.instance.estado
            != Almacigo.ESTADO_PENDIENTE
        ):
            raise serializers.ValidationError(
                {
                    "detail":
                        "No se puede modificar "
                        "un registro que ya fue procesado."
                }
            )

        return attrs


    def create(
        self,
        validated_data,
    ):
        try:
            configuracion = (
                ConfiguracionAlmacigo.objects.first()
            )

            if configuracion is None:
                configuracion = (
                    ConfiguracionAlmacigo.objects.create(
                        valor=Decimal(
                            "65000.00"
                        )
                    )
                )

            cantidad = validated_data[
                "cantidad"
            ]

            valor_unitario = (
                configuracion.valor
            )

            importe = (
                Decimal(
                    str(cantidad)
                )
                *
                valor_unitario
            )

            return Almacigo.objects.create(
                valor_unitario=
                    valor_unitario,
                importe=
                    importe,
                estado=
                    Almacigo.ESTADO_PENDIENTE,
                **validated_data,
            )

        except Exception as exc:
            print(
                "ERROR CREANDO ALMACIGO:",
                repr(exc),
            )

            raise


    def update(
        self,
        instance,
        validated_data,
    ):
        instance.fecha = (
            validated_data.get(
                "fecha",
                instance.fecha,
            )
        )

        instance.cantidad = (
            validated_data.get(
                "cantidad",
                instance.cantidad,
            )
        )

        instance.observacion = (
            validated_data.get(
                "observacion",
                instance.observacion,
            )
        )

        instance.importe = (
            Decimal(
                str(
                    instance.cantidad
                )
            )
            *
            instance.valor_unitario
        )

        instance.save()

        return instance

from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from rest_framework import serializers

from .models import (
    Comprador,
    Venta,
    PagoVenta,
)


class CompradorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comprador
        fields = [
            "id",
            "nombre",
            "cuit",
            "telefono",
            "observacion",
        ]

    def validate_nombre(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "El nombre del comprador es obligatorio."
            )

        return value


class PagoVentaSerializer(serializers.ModelSerializer):
    comprador_nombre = serializers.CharField(
        source="venta.comprador.nombre",
        read_only=True,
    )

    precio_unitario = serializers.DecimalField(
        source="venta.precio_unitario",
        max_digits=14,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = PagoVenta
        fields = [
            "id",
            "venta",
            "fecha",
            "cantidad_bolsas",
            "importe",
            "observacion",
            "comprador_nombre",
            "precio_unitario",
        ]

        read_only_fields = [
            "importe",
            "comprador_nombre",
            "precio_unitario",
        ]

    def validate_cantidad_bolsas(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "La cantidad debe ser mayor a 0."
            )

        return value

    def validate(self, attrs):
        venta = attrs.get(
            "venta",
            getattr(self.instance, "venta", None),
        )

        cantidad = attrs.get(
            "cantidad_bolsas",
            getattr(
                self.instance,
                "cantidad_bolsas",
                None,
            ),
        )

        if not venta or cantidad is None:
            return attrs

        pagos = venta.pagos.filter(
            is_deleted=False,
        )

        if self.instance:
            pagos = pagos.exclude(
                pk=self.instance.pk,
            )

        ya_pagadas = pagos.aggregate(
            total=Sum("cantidad_bolsas")
        )["total"] or 0

        disponibles = (
            venta.cantidad_bolsas
            - ya_pagadas
        )

        if cantidad > disponibles:
            raise serializers.ValidationError(
                {
                    "cantidad_bolsas": (
                        f"Solo quedan {disponibles} "
                        "bolsas pendientes."
                    )
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        venta = validated_data["venta"]

        Venta.objects.select_for_update().get(
            pk=venta.pk
        )

        pago = PagoVenta.objects.create(
            **validated_data,
            user_made=self.context[
                "request"
            ].user,
        )

        venta.actualizar_estado()

        return pago

    @transaction.atomic
    def update(
        self,
        instance,
        validated_data,
    ):
        venta = instance.venta

        Venta.objects.select_for_update().get(
            pk=venta.pk
        )

        for field, value in validated_data.items():
            setattr(
                instance,
                field,
                value,
            )

        request = self.context.get("request")

        if request:
            instance.user_updated = request.user

        instance.save()

        venta.actualizar_estado()

        return instance


class VentaSerializer(serializers.ModelSerializer):
    comprador_nombre = serializers.CharField(
        source="comprador.nombre",
        read_only=True,
    )

    total = serializers.DecimalField(
        max_digits=16,
        decimal_places=2,
        read_only=True,
    )

    cantidad_bolsas_pagadas = (
        serializers.IntegerField(
            read_only=True,
        )
    )

    cantidad_bolsas_pendientes = (
        serializers.IntegerField(
            read_only=True,
        )
    )

    total_pagado = serializers.DecimalField(
        max_digits=16,
        decimal_places=2,
        read_only=True,
    )

    saldo_pendiente = serializers.DecimalField(
        max_digits=16,
        decimal_places=2,
        read_only=True,
    )

    pago_inicial = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    cantidad_bolsas_pagadas_inicial = (
        serializers.IntegerField(
            write_only=True,
            required=False,
            allow_null=True,
        )
    )

    pagos = PagoVentaSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Venta

        fields = [
            "id",
            "fecha",
            "comprador",
            "comprador_nombre",
            "cantidad_bolsas",
            "precio_unitario",
            "total",
            "observacion",
            "estado",
            "cantidad_bolsas_pagadas",
            "cantidad_bolsas_pendientes",
            "total_pagado",
            "saldo_pendiente",
            "pago_inicial",
            "cantidad_bolsas_pagadas_inicial",
            "pagos",
        ]

        read_only_fields = [
            "estado",
            "total",
            "cantidad_bolsas_pagadas",
            "cantidad_bolsas_pendientes",
            "total_pagado",
            "saldo_pendiente",
        ]

    def validate_cantidad_bolsas(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "La cantidad de bolsas debe ser mayor a 0."
            )

        return value

    def validate_precio_unitario(self, value):
        if value <= Decimal("0"):
            raise serializers.ValidationError(
                "El precio unitario debe ser mayor a 0."
            )

        return value

    def validate(self, attrs):
        pago_inicial = attrs.get(
            "pago_inicial",
            False,
        )

        cantidad = attrs.get(
            "cantidad_bolsas"
        )

        cantidad_pagada = attrs.get(
            "cantidad_bolsas_pagadas_inicial"
        )

        if pago_inicial:
            if cantidad_pagada is None:
                cantidad_pagada = cantidad

                attrs[
                    "cantidad_bolsas_pagadas_inicial"
                ] = cantidad_pagada

            if cantidad_pagada < 1:
                raise serializers.ValidationError(
                    {
                        "cantidad_bolsas_pagadas_inicial": (
                            "La cantidad pagada debe "
                            "ser mayor a 0."
                        )
                    }
                )

            if (
                cantidad is not None
                and cantidad_pagada > cantidad
            ):
                raise serializers.ValidationError(
                    {
                        "cantidad_bolsas_pagadas_inicial": (
                            "No se pueden pagar más "
                            "bolsas que las vendidas."
                        )
                    }
                )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        pago_inicial = validated_data.pop(
            "pago_inicial",
            False,
        )

        cantidad_pagada = validated_data.pop(
            "cantidad_bolsas_pagadas_inicial",
            None,
        )

        request = self.context["request"]

        venta = Venta.objects.create(
            **validated_data,
            estado=Venta.Estado.PENDIENTE,
            user_made=request.user,
        )

        if pago_inicial:
            if cantidad_pagada is None:
                cantidad_pagada = (
                    venta.cantidad_bolsas
                )

            PagoVenta.objects.create(
                venta=venta,
                fecha=venta.fecha,
                cantidad_bolsas=cantidad_pagada,
                importe=(
                    Decimal(cantidad_pagada)
                    * venta.precio_unitario
                ),
                user_made=request.user,
            )

        venta.actualizar_estado()

        return venta

    @transaction.atomic
    def update(
        self,
        instance,
        validated_data,
    ):
        validated_data.pop(
            "pago_inicial",
            None,
        )

        validated_data.pop(
            "cantidad_bolsas_pagadas_inicial",
            None,
        )

        nueva_cantidad = validated_data.get(
            "cantidad_bolsas",
            instance.cantidad_bolsas,
        )

        pagadas = (
            instance.cantidad_bolsas_pagadas
        )

        if nueva_cantidad < pagadas:
            raise serializers.ValidationError(
                {
                    "cantidad_bolsas": (
                        f"No puede establecer "
                        f"{nueva_cantidad} bolsas porque "
                        f"ya existen {pagadas} bolsas "
                        "pagadas."
                    )
                }
            )

        request = self.context["request"]

        precio_anterior = (
            instance.precio_unitario
        )

        for field, value in validated_data.items():
            setattr(
                instance,
                field,
                value,
            )

        instance.user_updated = request.user
        instance.save()

        # Si cambia el precio unitario,
        # actualizamos los importes de los pagos
        # correspondientes a la misma venta.
        if (
            instance.precio_unitario
            != precio_anterior
        ):
            pagos = instance.pagos.filter(
                is_deleted=False,
            )

            for pago in pagos:
                pago.importe = (
                    Decimal(
                        pago.cantidad_bolsas
                    )
                    * instance.precio_unitario
                )

                pago.user_updated = request.user

                pago.save(
                    update_fields=[
                        "importe",
                        "user_updated",
                    ]
                )

        instance.actualizar_estado()

        return instance