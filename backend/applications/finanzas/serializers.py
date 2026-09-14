from decimal import Decimal

from django.db.models import Q, Sum
from rest_framework import serializers

from applications.finanzas.models import (
    CategoriaFinanciera,
    CuentaFinanciera,
    GrupoFinanciero,
    MovimientoFinanciero,
)


# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def calcular_saldo_hasta_movimiento(
    cuenta,
    movimiento,
):
    """
    Calcula cuánto dinero tenía una cuenta inmediatamente
    después del movimiento indicado.

    El orden histórico es:
        fecha ASC
        id ASC

    Incluye:
    - saldo inicial
    - ingresos recibidos
    - transferencias recibidas
    - cambios de moneda recibidos
    - gastos realizados
    - transferencias enviadas
    - cambios de moneda enviados
    """

    movimientos = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
        )
        .filter(
            Q(
                fecha__lt=movimiento.fecha
            )
            |
            Q(
                fecha=movimiento.fecha,
                id__lte=movimiento.id,
            )
        )
    )

    # ========================================================
    # INGRESOS
    # ========================================================

    ingresos = (
        movimientos
        .filter(
            cuenta_destino=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .INGRESO
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )

    # ========================================================
    # TRANSFERENCIAS RECIBIDAS
    # ========================================================

    transferencias_entrada = (
        movimientos
        .filter(
            cuenta_destino=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .TRANSFERENCIA
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )

    # ========================================================
    # CAMBIOS DE MONEDA RECIBIDOS
    # ========================================================

    cambios_entrada = (
        movimientos
        .filter(
            cuenta_destino=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .CAMBIO_MONEDA
            ),
        )
        .aggregate(
            total=Sum(
                "monto_destino"
            )
        )["total"]
        or Decimal("0.00")
    )

    # ========================================================
    # GASTOS
    # ========================================================

    gastos = (
        movimientos
        .filter(
            cuenta_origen=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .GASTO
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )

    # ========================================================
    # TRANSFERENCIAS ENVIADAS
    # ========================================================

    transferencias_salida = (
        movimientos
        .filter(
            cuenta_origen=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .TRANSFERENCIA
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )

    # ========================================================
    # CAMBIOS DE MONEDA ENVIADOS
    # ========================================================

    cambios_salida = (
        movimientos
        .filter(
            cuenta_origen=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .CAMBIO_MONEDA
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )

    return (
        cuenta.saldo_inicial
        + ingresos
        + transferencias_entrada
        + cambios_entrada
        - gastos
        - transferencias_salida
        - cambios_salida
    )




def calcular_saldo_actual(
    cuenta,
):

    ingresos = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            cuenta_destino=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .INGRESO
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )


    transferencias_entrada = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            cuenta_destino=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .TRANSFERENCIA
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )


    cambios_entrada = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            cuenta_destino=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .CAMBIO_MONEDA
            ),
        )
        .aggregate(
            total=Sum(
                "monto_destino"
            )
        )["total"]
        or Decimal("0.00")
    )


    gastos = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            cuenta_origen=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .GASTO
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )


    transferencias_salida = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            cuenta_origen=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .TRANSFERENCIA
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )


    cambios_salida = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            cuenta_origen=cuenta,
            tipo=(
                MovimientoFinanciero
                .Tipo
                .CAMBIO_MONEDA
            ),
        )
        .aggregate(
            total=Sum("monto")
        )["total"]
        or Decimal("0.00")
    )


    return (
        cuenta.saldo_inicial
        + ingresos
        + transferencias_entrada
        + cambios_entrada
        - gastos
        - transferencias_salida
        - cambios_salida
    )

# ============================================================
# GRUPO FINANCIERO
# ============================================================


class GrupoFinancieroSerializer(
    serializers.ModelSerializer
):

    tipo_display = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )

    cantidad_categorias = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = GrupoFinanciero

        fields = [
            "id",
            "nombre",
            "tipo",
            "tipo_display",
            "descripcion",
            "activo",
            "cantidad_categorias",
        ]

        read_only_fields = [
            "tipo_display",
            "cantidad_categorias",
        ]

    def get_cantidad_categorias(
        self,
        obj,
    ):
        return obj.categorias.filter(
            is_deleted=False,
        ).count()

    def validate_nombre(
        self,
        value,
    ):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "El nombre es obligatorio."
            )

        queryset = (
            GrupoFinanciero.objects
            .filter(
                nombre__iexact=value,
                is_deleted=False,
            )
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk,
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe un grupo financiero "
                "con ese nombre."
            )

        return value


# ============================================================
# CATEGORIA FINANCIERA
# ============================================================


class CategoriaFinancieraSerializer(
    serializers.ModelSerializer
):

    grupo_nombre = serializers.CharField(
        source="grupo.nombre",
        read_only=True,
    )

    grupo_tipo = serializers.CharField(
        source="grupo.tipo",
        read_only=True,
    )

    grupo_tipo_display = serializers.CharField(
        source="grupo.get_tipo_display",
        read_only=True,
    )

    cantidad_movimientos = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = CategoriaFinanciera

        fields = [
            "id",
            "grupo",
            "grupo_nombre",
            "grupo_tipo",
            "grupo_tipo_display",
            "nombre",
            "descripcion",
            "activo",
            "cantidad_movimientos",
        ]

        read_only_fields = [
            "grupo_nombre",
            "grupo_tipo",
            "grupo_tipo_display",
            "cantidad_movimientos",
        ]

    def get_cantidad_movimientos(
        self,
        obj,
    ):
        return obj.movimientos.filter(
            is_deleted=False,
        ).count()

    def validate(
        self,
        attrs,
    ):
        grupo = attrs.get(
            "grupo",
            getattr(
                self.instance,
                "grupo",
                None,
            ),
        )

        if grupo:

            if grupo.is_deleted:
                raise serializers.ValidationError({
                    "grupo": (
                        "El grupo seleccionado "
                        "está eliminado."
                    )
                })

            if not grupo.activo:
                raise serializers.ValidationError({
                    "grupo": (
                        "El grupo seleccionado "
                        "está inactivo."
                    )
                })

        nombre = attrs.get(
            "nombre",
            getattr(
                self.instance,
                "nombre",
                "",
            ),
        ).strip()

        if not nombre:
            raise serializers.ValidationError({
                "nombre": (
                    "El nombre es obligatorio."
                )
            })

        queryset = (
            CategoriaFinanciera.objects
            .filter(
                grupo=grupo,
                nombre__iexact=nombre,
                is_deleted=False,
            )
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk,
            )

        if queryset.exists():
            raise serializers.ValidationError({
                "nombre": (
                    "Ya existe una categoría "
                    "con ese nombre dentro "
                    "del grupo seleccionado."
                )
            })

        attrs["nombre"] = nombre

        return attrs


# ============================================================
# CUENTA FINANCIERA
# ============================================================


class CuentaFinancieraSerializer(
    serializers.ModelSerializer
):

    tipo_display = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )
    moneda_display = serializers.CharField(
        source="get_moneda_display",
        read_only=True,
    )
    saldo_actual = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = CuentaFinanciera

        fields = [
            "id",
            "nombre",
            "tipo",
            "tipo_display",
            "moneda",
            "moneda_display",
            "saldo_inicial",
            "saldo_actual",
            "descripcion",
            "activa",
        ]

        read_only_fields = [
            "tipo_display",
            "moneda_display",
            "saldo_actual",
        ]

    def get_saldo_actual(
        self,
        obj,
    ):
        return calcular_saldo_actual(
            obj
        )

    def validate_nombre(
        self,
        value,
    ):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "El nombre es obligatorio."
            )

        queryset = (
            CuentaFinanciera.objects
            .filter(
                nombre__iexact=value,
                is_deleted=False,
            )
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk,
            )

        if queryset.exists():
            raise serializers.ValidationError(
                "Ya existe una cuenta financiera "
                "con ese nombre."
            )

        return value


# ============================================================
# MOVIMIENTO FINANCIERO
# ============================================================

class MovimientoFinancieroSerializer(
    serializers.ModelSerializer
):

    tipo_display = serializers.CharField(
        source="get_tipo_display",
        read_only=True,
    )

    categoria_nombre = serializers.CharField(
        source="categoria.nombre",
        read_only=True,
    )

    grupo_id = serializers.IntegerField(
        source="categoria.grupo_id",
        read_only=True,
    )

    grupo_nombre = serializers.CharField(
        source="categoria.grupo.nombre",
        read_only=True,
    )

    cuenta_origen_nombre = serializers.CharField(
        source="cuenta_origen.nombre",
        read_only=True,
    )

    cuenta_destino_nombre = serializers.CharField(
        source="cuenta_destino.nombre",
        read_only=True,
    )

    cuenta_origen_moneda = serializers.CharField(
        source="cuenta_origen.moneda",
        read_only=True,
    )

    cuenta_destino_moneda = serializers.CharField(
        source="cuenta_destino.moneda",
        read_only=True,
    )


    saldo_cuenta_origen = (
        serializers.SerializerMethodField()
    )

    saldo_cuenta_destino = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = MovimientoFinanciero

        fields = [
            "id",
            "fecha",
            "descripcion",
            "tipo",
            "tipo_display",

            "monto",
            "monto_destino",
            "cotizacion",

            "categoria",
            "categoria_nombre",

            "grupo_id",
            "grupo_nombre",

            "cuenta_origen",
            "cuenta_origen_nombre",

            "cuenta_destino",
            "cuenta_destino_nombre",

            "saldo_cuenta_origen",
            "saldo_cuenta_destino",

            "cuenta_origen_moneda",
            "cuenta_destino_moneda",
            "observacion",
        ]

        read_only_fields = [
            "tipo_display",
            "categoria_nombre",
            "grupo_id",
            "grupo_nombre",
            "cuenta_origen_nombre",
            "cuenta_destino_nombre",
            "saldo_cuenta_origen",
            "saldo_cuenta_destino",
            "cuenta_origen_moneda",
            "cuenta_destino_moneda",
        ]

    # --------------------------------------------------------
    # SALDOS
    # --------------------------------------------------------

    def get_saldo_cuenta_origen(
        self,
        obj,
    ):

        saldos = self.context.get(
            "saldos_movimientos",
            {},
        )

        datos = saldos.get(
            obj.id,
            {},
        )

        return datos.get(
            "origen"
        )

    def get_saldo_cuenta_destino(
        self,
        obj,
    ):

        saldos = self.context.get(
            "saldos_movimientos",
            {},
        )

        datos = saldos.get(
            obj.id,
            {},
        )

        return datos.get(
            "destino"
        )

    # --------------------------------------------------------
    # VALIDACIONES
    # --------------------------------------------------------

    def validate(
        self,
        attrs,
    ):

        instance = self.instance

        tipo = attrs.get(
            "tipo",
            getattr(
                instance,
                "tipo",
                None,
            ),
        )

        categoria = attrs.get(
            "categoria",
            getattr(
                instance,
                "categoria",
                None,
            ),
        )

        cuenta_origen = attrs.get(
            "cuenta_origen",
            getattr(
                instance,
                "cuenta_origen",
                None,
            ),
        )

        cuenta_destino = attrs.get(
            "cuenta_destino",
            getattr(
                instance,
                "cuenta_destino",
                None,
            ),
        )

        monto_destino = attrs.get(
            "monto_destino",
            getattr(
                instance,
                "monto_destino",
                None,
            ),
        )

        cotizacion = attrs.get(
            "cotizacion",
            getattr(
                instance,
                "cotizacion",
                None,
            ),
        )

        # ====================================================
        # VALIDAR CUENTA ORIGEN
        # ====================================================

        if cuenta_origen:

            if cuenta_origen.is_deleted:
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "La cuenta seleccionada "
                        "está eliminada."
                    )
                })

            if not cuenta_origen.activa:
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "La cuenta seleccionada "
                        "está inactiva."
                    )
                })

        # ====================================================
        # VALIDAR CUENTA DESTINO
        # ====================================================

        if cuenta_destino:

            if cuenta_destino.is_deleted:
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "La cuenta seleccionada "
                        "está eliminada."
                    )
                })

            if not cuenta_destino.activa:
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "La cuenta seleccionada "
                        "está inactiva."
                    )
                })

        # ====================================================
        # INGRESO
        # ====================================================

        if (
            tipo
            == MovimientoFinanciero.Tipo.INGRESO
        ):

            if not cuenta_destino:
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "Un ingreso debe tener "
                        "una cuenta destino."
                    )
                })

            if cuenta_origen:
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "Un ingreso no debe tener "
                        "una cuenta origen."
                    )
                })

            if not categoria:
                raise serializers.ValidationError({
                    "categoria": (
                        "Un ingreso debe tener "
                        "una categoría."
                    )
                })

            if (
                categoria
                and categoria.grupo
                and categoria.grupo.tipo
                == GrupoFinanciero.Tipo.EGRESO
            ):
                raise serializers.ValidationError({
                    "categoria": (
                        "La categoría seleccionada "
                        "pertenece a un grupo "
                        "exclusivamente de egresos."
                    )
                })

            if (
                monto_destino is not None
                or cotizacion is not None
            ):
                raise serializers.ValidationError({
                    "monto_destino": (
                        "Un ingreso no debe tener "
                        "datos de cambio de moneda."
                    )
                })

        # ====================================================
        # GASTO
        # ====================================================

        elif (
            tipo
            == MovimientoFinanciero.Tipo.GASTO
        ):

            if not cuenta_origen:
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "Un gasto debe tener "
                        "una cuenta origen."
                    )
                })

            if cuenta_destino:
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "Un gasto no debe tener "
                        "una cuenta destino."
                    )
                })

            if not categoria:
                raise serializers.ValidationError({
                    "categoria": (
                        "Un gasto debe tener "
                        "una categoría."
                    )
                })

            if (
                categoria
                and categoria.grupo
                and categoria.grupo.tipo
                == GrupoFinanciero.Tipo.INGRESO
            ):
                raise serializers.ValidationError({
                    "categoria": (
                        "La categoría seleccionada "
                        "pertenece a un grupo "
                        "exclusivamente de ingresos."
                    )
                })

            if (
                monto_destino is not None
                or cotizacion is not None
            ):
                raise serializers.ValidationError({
                    "monto_destino": (
                        "Un gasto no debe tener "
                        "datos de cambio de moneda."
                    )
                })

        # ====================================================
        # TRANSFERENCIA
        # ====================================================

        elif (
            tipo
            == MovimientoFinanciero.Tipo.TRANSFERENCIA
        ):

            if not cuenta_origen:
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "Una transferencia debe "
                        "tener una cuenta origen."
                    )
                })

            if not cuenta_destino:
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "Una transferencia debe "
                        "tener una cuenta destino."
                    )
                })

            if (
                cuenta_origen
                and cuenta_destino
                and cuenta_origen.id
                == cuenta_destino.id
            ):
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "La cuenta destino debe "
                        "ser diferente a la "
                        "cuenta origen."
                    )
                })

            if (
                cuenta_origen
                and cuenta_destino
                and cuenta_origen.moneda
                != cuenta_destino.moneda
            ):
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "No se puede realizar una "
                        "transferencia directa entre "
                        "cuentas de distintas monedas."
                    )
                })

            if categoria:
                raise serializers.ValidationError({
                    "categoria": (
                        "Una transferencia no "
                        "debe tener categoría."
                    )
                })

            if (
                monto_destino is not None
                or cotizacion is not None
            ):
                raise serializers.ValidationError({
                    "monto_destino": (
                        "Una transferencia no debe "
                        "tener datos de cambio "
                        "de moneda."
                    )
                })

        # ====================================================
        # CAMBIO DE MONEDA
        # ====================================================

        elif (
            tipo
            == MovimientoFinanciero.Tipo.CAMBIO_MONEDA
        ):

            if not cuenta_origen:
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "Un cambio de moneda debe "
                        "tener una cuenta origen."
                    )
                })

            if not cuenta_destino:
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "Un cambio de moneda debe "
                        "tener una cuenta destino."
                    )
                })

            if (
                cuenta_origen
                and cuenta_destino
                and cuenta_origen.id
                == cuenta_destino.id
            ):
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "La cuenta destino debe "
                        "ser diferente a la "
                        "cuenta origen."
                    )
                })

            if (
                cuenta_origen
                and cuenta_destino
                and cuenta_origen.moneda
                == cuenta_destino.moneda
            ):
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "En un cambio de moneda "
                        "las cuentas deben tener "
                        "monedas diferentes."
                    )
                })

            if categoria:
                raise serializers.ValidationError({
                    "categoria": (
                        "Un cambio de moneda no "
                        "debe tener categoría."
                    )
                })

            if (
                monto_destino is None
                or monto_destino <= 0
            ):
                raise serializers.ValidationError({
                    "monto_destino": (
                        "Ingresá un monto destino "
                        "válido."
                    )
                })

            if (
                cotizacion is None
                or cotizacion <= 0
            ):
                raise serializers.ValidationError({
                    "cotizacion": (
                        "Ingresá una cotización "
                        "válida."
                    )
                })

        # ====================================================
        # TIPO INVALIDO
        # ====================================================

        else:

            raise serializers.ValidationError({
                "tipo": (
                    "Tipo de movimiento inválido."
                )
            })

        # ====================================================
        # VALIDAR CATEGORIA
        # ====================================================

        if categoria:

            if categoria.is_deleted:
                raise serializers.ValidationError({
                    "categoria": (
                        "La categoría seleccionada "
                        "está eliminada."
                    )
                })

            if not categoria.activo:
                raise serializers.ValidationError({
                    "categoria": (
                        "La categoría seleccionada "
                        "está inactiva."
                    )
                })

            if (
                categoria.grupo
                and not categoria.grupo.activo
            ):
                raise serializers.ValidationError({
                    "categoria": (
                        "El grupo de la categoría "
                        "está inactivo."
                    )
                })

        return attrs


class CategoriaFinancieraSelectorSerializer(
    serializers.ModelSerializer
):

    grupo_nombre = serializers.CharField(
        source="grupo.nombre",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = CategoriaFinanciera

        fields = [
            "id",
            "nombre",
            "grupo_nombre",
        ]

class CuentaFinancieraSelectorSerializer(
    serializers.ModelSerializer
):
    moneda_display = serializers.CharField(
        source="get_moneda_display",
        read_only=True,
    )
    class Meta:
        model = CuentaFinanciera

        fields = [
            "id",
            "moneda",
            "moneda_display",
            "nombre",
        ]



class CambioMonedaSerializer(
    serializers.Serializer
):

    class Operacion:
        COMPRAR_USD = "COMPRAR_USD"
        COMPRAR_ARS = "COMPRAR_ARS"

    OPERACIONES = (
        (
            Operacion.COMPRAR_USD,
            "Comprar dólares",
        ),
        (
            Operacion.COMPRAR_ARS,
            "Comprar pesos",
        ),
    )

    operacion = serializers.ChoiceField(
        choices=OPERACIONES,
    )

    fecha = serializers.DateField()

    descripcion = serializers.CharField(
        max_length=255,
    )

    monto = serializers.DecimalField(
        max_digits=16,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )

    cotizacion = serializers.DecimalField(
        max_digits=16,
        decimal_places=4,
        min_value=Decimal("0.0001"),
    )

    cuenta_origen = (
        serializers.PrimaryKeyRelatedField(
            queryset=(
                CuentaFinanciera.objects
                .filter(
                    is_deleted=False,
                    activa=True,
                )
            ),
        )
    )

    cuenta_destino = (
        serializers.PrimaryKeyRelatedField(
            queryset=(
                CuentaFinanciera.objects
                .filter(
                    is_deleted=False,
                    activa=True,
                )
            ),
        )
    )

    observacion = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        default="",
    )

    def validate_descripcion(
        self,
        value,
    ):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Ingresá una descripción."
            )

        return value

    def validate(
        self,
        attrs,
    ):

        operacion = attrs[
            "operacion"
        ]

        cuenta_origen = attrs[
            "cuenta_origen"
        ]

        cuenta_destino = attrs[
            "cuenta_destino"
        ]

        if (
            cuenta_origen.id
            == cuenta_destino.id
        ):
            raise serializers.ValidationError({
                "cuenta_destino": (
                    "La cuenta destino debe "
                    "ser diferente a la "
                    "cuenta origen."
                )
            })

        # ====================================================
        # COMPRAR DOLARES
        # ====================================================

        if (
            operacion
            == self.Operacion.COMPRAR_USD
        ):

            if (
                cuenta_origen.moneda
                != CuentaFinanciera.Moneda.ARS
            ):
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "Para comprar dólares, "
                        "la cuenta origen debe "
                        "ser en pesos."
                    )
                })

            if (
                cuenta_destino.moneda
                != CuentaFinanciera.Moneda.USD
            ):
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "Para comprar dólares, "
                        "la cuenta destino debe "
                        "ser en dólares."
                    )
                })

        # ====================================================
        # COMPRAR PESOS
        # ====================================================

        elif (
            operacion
            == self.Operacion.COMPRAR_ARS
        ):

            if (
                cuenta_origen.moneda
                != CuentaFinanciera.Moneda.USD
            ):
                raise serializers.ValidationError({
                    "cuenta_origen": (
                        "Para comprar pesos, "
                        "la cuenta origen debe "
                        "ser en dólares."
                    )
                })

            if (
                cuenta_destino.moneda
                != CuentaFinanciera.Moneda.ARS
            ):
                raise serializers.ValidationError({
                    "cuenta_destino": (
                        "Para comprar pesos, "
                        "la cuenta destino debe "
                        "ser en pesos."
                    )
                })

        return attrs