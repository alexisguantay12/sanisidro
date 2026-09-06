from decimal import Decimal

from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q, F

from applications.core.models import BaseAbstractWithUser


# ============================================================
# LIQUIDACION DE PERSONAL
# ============================================================


class LiquidacionPersonal(BaseAbstractWithUser):
    """
    Representa un pago realizado a un peón.

    El detalle de lo pagado queda congelado en:
    - DetalleLiquidacionTarja
    - DetalleLiquidacionHoraExtra

    Esto evita que una liquidación histórica cambie si luego
    cambia el valor del jornal u otra configuración.
    """

    peon = models.ForeignKey(
        "gestion.Peon",
        on_delete=models.PROTECT,
        related_name="liquidaciones_personal",
        verbose_name="peón",
    )

    fecha_desde = models.DateField(
        verbose_name="fecha desde",
    )

    fecha_hasta = models.DateField(
        verbose_name="fecha hasta",
    )

    fecha_pago = models.DateField(
        verbose_name="fecha de pago",
    )
    cuenta_financiera = models.ForeignKey(
        "finanzas.CuentaFinanciera",
        on_delete=models.PROTECT,
        related_name="liquidaciones_personal",
        null=True,
        blank=True,
        verbose_name="cuenta financiera",
    )

    total_tarjas = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="total tarjas",
    )

    total_horas_extra = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="total horas extra",
    )
    total_descuentos = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(
                Decimal("0.00")
            ),
        ],
        verbose_name="total descuentos",
    )
    total_administracion = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(
                Decimal("0.00")
            ),
        ],
        verbose_name="total administración",
    )


    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="total",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )
    class Estado(models.TextChoices):
        ACTIVA = "ACTIVA", "Activa"
        ANULADA = "ANULADA", "Anulada"


    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.ACTIVA,
        db_index=True,
        verbose_name="estado",
    )

    fecha_anulacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="fecha de anulación",
    )

    motivo_anulacion = models.TextField(
        blank=True,
        default="",
        verbose_name="motivo de anulación",
    )




    class Meta:
        ordering = [
            "-fecha_pago",
            "-id",
        ]

        verbose_name = "liquidación de personal"
        verbose_name_plural = "liquidaciones de personal"

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    fecha_hasta__gte=F("fecha_desde")
                ),
                name="liquidacion_personal_periodo_valido",
            ),
        ]

    def __str__(self):
        return (
            f"Liquidación #{self.pk} - "
            f"{self.peon} - "
            f"${self.total}"
        )


# ============================================================
# DETALLE TARJA
# ============================================================


class DetalleLiquidacionTarja(BaseAbstractWithUser):
    """
    Tarja incluida en una liquidación de personal.

    Se guardan valores históricos de la tarja y del jornal
    aplicado al momento del pago.
    """

    liquidacion = models.ForeignKey(
        LiquidacionPersonal,
        on_delete=models.PROTECT,
        related_name="detalles_tarjas",
        verbose_name="liquidación",
    )

    tarja = models.ForeignKey(
        "gestion.Tarja",
        on_delete=models.PROTECT,
        related_name="detalles_liquidacion",
        verbose_name="tarja",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    fraccion = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        verbose_name="fracción de jornal",
    )

    valor_jornal_aplicado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="valor del jornal aplicado",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="importe",
    )

    tarea = models.CharField(
        max_length=30,
        blank=True,
        default="",
        verbose_name="tarea",
    )

    observacion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Meta:
        ordering = [
            "fecha",
            "id",
        ]

        verbose_name = "detalle de tarja liquidada"
        verbose_name_plural = "detalles de tarjas liquidadas"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "tarja",
                ],
                condition=Q(
                    is_deleted=False,
                ),
                name="unique_tarja_liquidada_activa",
            ),
        ]

    def __str__(self):
        return (
            f"{self.tarja} - "
            f"${self.importe}"
        )

# ============================================================
# DETALLE DESCUENTO POR TARJA EXTERNA
# ============================================================


class DetalleLiquidacionTarjaExterna(
    BaseAbstractWithUser
):
    """
    Representa un jornal que se descuenta de la liquidación
    porque otro peón trabajó para el peón liquidado.

    Ejemplo:
        Juan trabajó para Pedro.

        - Juan cobra normalmente su tarja.
        - A Pedro se le descuenta este jornal.
    """

    liquidacion = models.ForeignKey(
        LiquidacionPersonal,
        on_delete=models.PROTECT,
        related_name="detalles_tarjas_externas",
        verbose_name="liquidación",
    )

    tarja = models.ForeignKey(
        "gestion.Tarja",
        on_delete=models.PROTECT,
        related_name="detalles_descuento_liquidacion",
        verbose_name="tarja externa",
    )

    peon_origen = models.ForeignKey(
        "gestion.Peon",
        on_delete=models.PROTECT,
        related_name="descuentos_generados",
        verbose_name="peón que trabajó",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    fraccion = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        verbose_name="fracción de jornal",
    )

    valor_jornal_aplicado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            ),
        ],
        verbose_name="valor del jornal aplicado",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            ),
        ],
        verbose_name="importe descontado",
    )

    class Meta:
        ordering = [
            "fecha",
            "id",
        ]

        verbose_name = (
            "descuento por tarja externa"
        )

        verbose_name_plural = (
            "descuentos por tarjas externas"
        )

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "tarja",
                ],
                condition=Q(
                    is_deleted=False,
                ),
                name=(
                    "unique_tarja_externa_"
                    "descontada_activa"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"{self.peon_origen} - "
            f"{self.fecha} - "
            f"-${self.importe}"
        )



# ============================================================
# DETALLE HORA EXTRA
# ============================================================


class DetalleLiquidacionHoraExtra(BaseAbstractWithUser):
    """
    Hora extra incluida en una liquidación.

    Guardamos el valor aplicado en ese momento para conservar
    el histórico aunque el jornal cambie posteriormente.
    """

    liquidacion = models.ForeignKey(
        LiquidacionPersonal,
        on_delete=models.PROTECT,
        related_name="detalles_horas_extra",
        verbose_name="liquidación",
    )

    hora_extra = models.ForeignKey(
        "gestion.HoraExtra",
        on_delete=models.PROTECT,
        related_name="detalles_liquidacion",
        verbose_name="hora extra",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    cantidad_horas = models.PositiveSmallIntegerField(
        verbose_name="cantidad de horas",
    )

    motivo = models.CharField(
        max_length=20,
        verbose_name="motivo",
    )

    valor_jornal_aplicado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="valor del jornal aplicado",
    )

    valor_hora = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="valor por hora",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="importe",
    )

    class Meta:
        ordering = [
            "fecha",
            "id",
        ]

        verbose_name = "detalle de hora extra liquidada"
        verbose_name_plural = "detalles de horas extra liquidadas"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "hora_extra",
                ],
                condition=Q(
                    is_deleted=False,
                ),
                name="unique_hora_extra_liquidada_activa",
            ),
        ]

    def __str__(self):
        return (
            f"{self.hora_extra} - "
            f"${self.importe}"
        )


# ============================================================
# LIQUIDACION TRACTOR
# ============================================================


class LiquidacionTractor(BaseAbstractWithUser):
    """
    Una misma cabecera sirve tanto para Sergio como para
    servicios de tractor de terceros.
    """

    TIPO_SERGIO = "SERGIO"
    TIPO_TERCERO = "TERCERO"

    TIPOS = [
        (
            TIPO_SERGIO,
            "Sergio",
        ),
        (
            TIPO_TERCERO,
            "Tercero",
        ),
    ]

    tipo = models.CharField(
        max_length=20,
        choices=TIPOS,
        db_index=True,
        verbose_name="tipo",
    )

    proveedor = models.ForeignKey(
        "gestion.Proveedor",
        on_delete=models.PROTECT,
        related_name="liquidaciones_tractor",
        null=True,
        blank=True,
        verbose_name="proveedor",
    )
    cuenta_financiera = models.ForeignKey(
        "finanzas.CuentaFinanciera",
        on_delete=models.PROTECT,
        related_name="liquidaciones_tractor",
        null=True,
        blank=True,
        verbose_name="cuenta financiera",
    )
    fecha_desde = models.DateField(
        verbose_name="fecha desde",
    )

    fecha_hasta = models.DateField(
        verbose_name="fecha hasta",
    )

    fecha_pago = models.DateField(
        verbose_name="fecha de pago",
    )

    total_horas = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="total de horas",
    )

    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="total",
    )

    class Estado(models.TextChoices):
        ACTIVA = "ACTIVA", "Activa"
        ANULADA = "ANULADA", "Anulada"


    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.ACTIVA,
        db_index=True,
        verbose_name="estado",
    )

    fecha_anulacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="fecha de anulación",
    )

    motivo_anulacion = models.TextField(
        blank=True,
        default="",
        verbose_name="motivo de anulación",
    )


    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Meta:
        ordering = [
            "-fecha_pago",
            "-id",
        ]

        verbose_name = "liquidación de tractor"
        verbose_name_plural = "liquidaciones de tractor"

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    fecha_hasta__gte=F("fecha_desde")
                ),
                name="liquidacion_tractor_periodo_valido",
            ),
        ]

    def clean(self):
        super().clean()

        if (
            self.tipo == self.TIPO_SERGIO
            and self.proveedor_id
        ):
            raise ValidationError(
                {
                    "proveedor": (
                        "Una liquidación de Sergio "
                        "no debe tener proveedor."
                    )
                }
            )

        if (
            self.tipo == self.TIPO_TERCERO
            and not self.proveedor_id
        ):
            raise ValidationError(
                {
                    "proveedor": (
                        "Una liquidación de tractor "
                        "de tercero requiere proveedor."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.tipo == self.TIPO_SERGIO:
            nombre = "Sergio"
        else:
            nombre = (
                self.proveedor.nombre
                if self.proveedor_id
                else "Tercero"
            )

        return (
            f"Liquidación tractor #{self.pk} - "
            f"{nombre} - "
            f"${self.total}"
        )


# ============================================================
# DETALLE LIQUIDACION TRACTOR
# ============================================================


class DetalleLiquidacionTractor(BaseAbstractWithUser):
    """
    Cada registro apunta a TractorSergio O TractorTercero.

    Nunca a ambos.
    """

    liquidacion = models.ForeignKey(
        LiquidacionTractor,
        on_delete=models.PROTECT,
        related_name="detalles",
        verbose_name="liquidación",
    )

    tractor_sergio = models.ForeignKey(
        "gestion.TractorSergio",
        on_delete=models.PROTECT,
        related_name="detalles_liquidacion",
        null=True,
        blank=True,
        verbose_name="trabajo tractor Sergio",
    )

    tractor_tercero = models.ForeignKey(
        "gestion.TractorTercero",
        on_delete=models.PROTECT,
        related_name="detalles_liquidacion",
        null=True,
        blank=True,
        verbose_name="trabajo tractor tercero",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    cantidad_horas = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="cantidad de horas",
    )

    valor_hora = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="valor hora",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="importe",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Meta:
        ordering = [
            "fecha",
            "id",
        ]

        verbose_name = "detalle de liquidación de tractor"
        verbose_name_plural = "detalles de liquidaciones de tractor"

        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(
                        tractor_sergio__isnull=False,
                        tractor_tercero__isnull=True,
                    )
                    |
                    Q(
                        tractor_sergio__isnull=True,
                        tractor_tercero__isnull=False,
                    )
                ),
                name="detalle_tractor_un_solo_origen",
            ),

            models.UniqueConstraint(
                fields=[
                    "tractor_sergio",
                ],
                condition=Q(
                    is_deleted=False,
                    tractor_sergio__isnull=False,
                ),
                name="unique_tractor_sergio_liquidado",
            ),

            models.UniqueConstraint(
                fields=[
                    "tractor_tercero",
                ],
                condition=Q(
                    is_deleted=False,
                    tractor_tercero__isnull=False,
                ),
                name="unique_tractor_tercero_liquidado",
            ),
        ]

    def clean(self):
        super().clean()

        if bool(
            self.tractor_sergio_id
        ) == bool(
            self.tractor_tercero_id
        ):
            raise ValidationError(
                (
                    "Debe especificarse exactamente un trabajo "
                    "de tractor: Sergio o tercero."
                )
            )

        if (
            self.tractor_sergio_id
            and self.liquidacion.tipo
            != LiquidacionTractor.TIPO_SERGIO
        ):
            raise ValidationError(
                {
                    "tractor_sergio": (
                        "Este trabajo no corresponde "
                        "al tipo de liquidación."
                    )
                }
            )

        if (
            self.tractor_tercero_id
            and self.liquidacion.tipo
            != LiquidacionTractor.TIPO_TERCERO
        ):
            raise ValidationError(
                {
                    "tractor_tercero": (
                        "Este trabajo no corresponde "
                        "al tipo de liquidación."
                    )
                }
            )

        if (
            self.tractor_tercero_id
            and self.liquidacion.proveedor_id
            != self.tractor_tercero.proveedor_id
        ):
            raise ValidationError(
                {
                    "tractor_tercero": (
                        "El proveedor del trabajo no coincide "
                        "con el proveedor de la liquidación."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Detalle tractor #{self.pk} - "
            f"{self.fecha} - "
            f"${self.importe}"
        )


# ============================================================
# LIQUIDACION ALMACIGOS
# ============================================================


class LiquidacionAlmacigo(BaseAbstractWithUser):
    fecha_desde = models.DateField(
        verbose_name="fecha desde",
    )

    fecha_hasta = models.DateField(
        verbose_name="fecha hasta",
    )

    fecha_pago = models.DateField(
        verbose_name="fecha de pago",
    )
    cuenta_financiera = models.ForeignKey(
        "finanzas.CuentaFinanciera",
        on_delete=models.PROTECT,
        related_name="liquidaciones_almacigos",
        null=True,
        blank=True,
        verbose_name="cuenta financiera",
    )

    cantidad_total = models.PositiveIntegerField(
        default=0,
        verbose_name="cantidad total",
    )

    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="total",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )


    class Estado(models.TextChoices):
        ACTIVA = "ACTIVA", "Activa"
        ANULADA = "ANULADA", "Anulada"


    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.ACTIVA,
        db_index=True,
        verbose_name="estado",
    )

    fecha_anulacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="fecha de anulación",
    )

    motivo_anulacion = models.TextField(
        blank=True,
        default="",
        verbose_name="motivo de anulación",
    )




    class Meta:
        ordering = [
            "-fecha_pago",
            "-id",
        ]

        verbose_name = "liquidación de almácigos"
        verbose_name_plural = "liquidaciones de almácigos"

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    fecha_hasta__gte=F("fecha_desde")
                ),
                name="liquidacion_almacigo_periodo_valido",
            ),
        ]

    def __str__(self):
        return (
            f"Liquidación almácigos #{self.pk} - "
            f"${self.total}"
        )


# ============================================================
# DETALLE LIQUIDACION ALMACIGO
# ============================================================


class DetalleLiquidacionAlmacigo(BaseAbstractWithUser):
    liquidacion = models.ForeignKey(
        LiquidacionAlmacigo,
        on_delete=models.PROTECT,
        related_name="detalles",
        verbose_name="liquidación",
    )

    almacigo = models.ForeignKey(
        "gestion.Almacigo",
        on_delete=models.PROTECT,
        related_name="detalles_liquidacion",
        verbose_name="almácigo",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    cantidad = models.PositiveIntegerField(
        verbose_name="cantidad",
    )

    valor_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="valor unitario",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="importe",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Meta:
        ordering = [
            "fecha",
            "id",
        ]

        verbose_name = "detalle de almácigo liquidado"
        verbose_name_plural = "detalles de almácigos liquidados"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "almacigo",
                ],
                condition=Q(
                    is_deleted=False,
                ),
                name="unique_almacigo_liquidado_activo",
            ),
        ]

    def __str__(self):
        return (
            f"{self.almacigo} - "
            f"${self.importe}"
        )


# ============================================================
# RENDICION DE VENTAS
# ============================================================


class RendicionVenta(BaseAbstractWithUser):
    """
    Representa el dinero que Sergio entrega/rinde a la
    administración proveniente de cobros de ventas.

    No es una venta nueva ni un nuevo pago del comprador.
    Agrupa PagoVenta ya existentes.
    """

    fecha = models.DateField(
        verbose_name="fecha de rendición",
    )

    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="total rendido",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )
    class Estado(models.TextChoices):
        ACTIVA = "ACTIVA", "Activa"
        ANULADA = "ANULADA", "Anulada"


    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.ACTIVA,
        db_index=True,
        verbose_name="estado",
    )

    cuenta_financiera = models.ForeignKey(
        "finanzas.CuentaFinanciera",
        on_delete=models.PROTECT,
        related_name="rendiciones_ventas",
        null=True,
        blank=True,
        verbose_name="cuenta financiera",
    )


    fecha_anulacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="fecha de anulación",
    )

    motivo_anulacion = models.TextField(
        blank=True,
        default="",
        verbose_name="motivo de anulación",
    )



    class Meta:
        ordering = [
            "-fecha",
            "-id",
        ]

        verbose_name = "rendición de ventas"
        verbose_name_plural = "rendiciones de ventas"

    def __str__(self):
        return (
            f"Rendición #{self.pk} - "
            f"{self.fecha} - "
            f"${self.total}"
        )


# ============================================================
# DETALLE RENDICION DE VENTA
# ============================================================


class DetalleRendicionVenta(BaseAbstractWithUser):
    """
    Cada PagoVenta puede formar parte de una sola rendición.

    Guardamos además comprador, venta, bolsas e importe como
    snapshot para que el comprobante histórico sea independiente
    de cambios posteriores.
    """

    rendicion = models.ForeignKey(
        RendicionVenta,
        on_delete=models.PROTECT,
        related_name="detalles",
        verbose_name="rendición",
    )

    pago_venta = models.ForeignKey(
        "gestion.PagoVenta",
        on_delete=models.PROTECT,
        related_name="detalles_rendicion",
        verbose_name="pago de venta",
    )

    venta = models.ForeignKey(
        "gestion.Venta",
        on_delete=models.PROTECT,
        related_name="detalles_rendicion",
        verbose_name="venta",
    )

    comprador = models.ForeignKey(
        "gestion.Comprador",
        on_delete=models.PROTECT,
        related_name="detalles_rendicion",
        verbose_name="comprador",
    )

    fecha_pago = models.DateField(
        verbose_name="fecha del pago",
    )

    cantidad_bolsas = models.PositiveIntegerField(
        verbose_name="cantidad de bolsas",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
        ],
        verbose_name="importe",
    )

    class Meta:
        ordering = [
            "fecha_pago",
            "id",
        ]

        verbose_name = "detalle de rendición de venta"
        verbose_name_plural = "detalles de rendiciones de ventas"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "pago_venta",
                ],
                condition=Q(
                    is_deleted=False,
                ),
                name="unique_pago_venta_rendido_activo",
            ),
        ]

    def clean(self):
        super().clean()

        if not self.pago_venta_id:
            return

        if (
            self.venta_id
            and self.venta_id
            != self.pago_venta.venta_id
        ):
            raise ValidationError(
                {
                    "venta": (
                        "La venta no corresponde "
                        "al pago seleccionado."
                    )
                }
            )

        if (
            self.comprador_id
            and self.comprador_id
            != self.pago_venta.venta.comprador_id
        ):
            raise ValidationError(
                {
                    "comprador": (
                        "El comprador no corresponde "
                        "al pago seleccionado."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Pago #{self.pago_venta_id} - "
            f"${self.importe}"
        )







class ValorAdministrador(
    BaseAbstractWithUser
):
    """
    Define qué peón cumple el rol de administrador
    durante un período determinado.

    No representa un pago.
    Solo define la vigencia del administrador y
    la cantidad de jornales mensuales que le corresponden.
    """

    peon = models.ForeignKey(
        "gestion.Peon",
        on_delete=models.PROTECT,
        related_name="vigencias_administrador",
        verbose_name="administrador",
    )

    cantidad_jornales = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("6.00"),
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ],
        verbose_name="cantidad de jornales",
    )

    vigente_desde = models.DateField(
        verbose_name="vigente desde",
        db_index=True,
    )

    vigente_hasta = models.DateField(
        null=True,
        blank=True,
        verbose_name="vigente hasta",
        db_index=True,
    )

    class Meta:
        ordering = [
            "-vigente_desde",
            "-id",
        ]

        verbose_name = "valor administrador"
        verbose_name_plural = "valores administrador"

        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(
                        vigente_hasta__isnull=True
                    )
                    |
                    Q(
                        vigente_hasta__gte=
                        models.F(
                            "vigente_desde"
                        )
                    )
                ),
                name=(
                    "valor_administrador_"
                    "vigencia_valida"
                ),
            ),
        ]

    def __str__(self):
        hasta = (
            self.vigente_hasta
            if self.vigente_hasta
            else "actualidad"
        )

        return (
            f"{self.peon} - "
            f"{self.cantidad_jornales} jornales - "
            f"{self.vigente_desde} "
            f"hasta {hasta}"
        )




class DetalleLiquidacionAdministracion(
    BaseAbstractWithUser
):
    """
    Registra que una administración mensual
    fue incluida en una liquidación de personal.

    Este modelo es el que determina si un mes
    ya fue pagado o todavía debe aparecer como pendiente.
    """

    liquidacion = models.ForeignKey(
        LiquidacionPersonal,
        on_delete=models.PROTECT,
        related_name="detalles_administracion",
        verbose_name="liquidación",
    )

    valor_administrador = models.ForeignKey(
        ValorAdministrador,
        on_delete=models.PROTECT,
        related_name="detalles_liquidacion",
        verbose_name="configuración administrador",
    )

    anio = models.PositiveSmallIntegerField(
        verbose_name="año",
    )

    mes = models.PositiveSmallIntegerField(
        verbose_name="mes",
    )

    cantidad_jornales = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ],
        verbose_name="cantidad de jornales",
    )

    valor_jornal_aplicado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ],
        verbose_name="valor jornal aplicado",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            )
        ],
        verbose_name="importe",
    )

    class Meta:
        ordering = [
            "anio",
            "mes",
            "id",
        ]

        verbose_name = (
            "detalle liquidación administración"
        )

        verbose_name_plural = (
            "detalles liquidación administración"
        )

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "valor_administrador",
                    "anio",
                    "mes",
                ],
                condition=Q(
                    is_deleted=False,
                ),
                name=(
                    "unique_administracion_"
                    "mes_liquidada"
                ),
            ),
        ]
    def __str__(self):
        return (
            f"{self.valor_administrador.peon} - "
            f"{self.mes}/{self.anio} - "
            f"${self.importe}"
        )







# ============================================================
# LIQUIDACION DE CARPIDAS
# ============================================================


class LiquidacionCarpida(BaseAbstractWithUser):
    """
    Representa un pago de uno o varios jornales de carpida.

    La cabecera guarda los datos generales del pago.
    Los valores históricos de cada carpida quedan congelados
    en DetalleLiquidacionCarpida.

    El movimiento financiero correspondiente se genera
    desde el módulo de administración al registrar el pago.
    """

    fecha_desde = models.DateField(
        verbose_name="fecha desde",
    )

    fecha_hasta = models.DateField(
        verbose_name="fecha hasta",
    )

    fecha_pago = models.DateField(
        verbose_name="fecha de pago",
        db_index=True,
    )

    cuenta_financiera = models.ForeignKey(
        "finanzas.CuentaFinanciera",
        on_delete=models.PROTECT,
        related_name="liquidaciones_carpidas",
        verbose_name="cuenta financiera",
    )

    cantidad_carpidas = models.PositiveIntegerField(
        default=0,
        verbose_name="cantidad de carpidas",
    )

    total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[
            MinValueValidator(
                Decimal("0.00")
            ),
        ],
        verbose_name="total",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Estado(models.TextChoices):
        ACTIVA = "ACTIVA", "Activa"
        ANULADA = "ANULADA", "Anulada"

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.ACTIVA,
        db_index=True,
        verbose_name="estado",
    )

    fecha_anulacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="fecha de anulación",
    )

    motivo_anulacion = models.TextField(
        blank=True,
        default="",
        verbose_name="motivo de anulación",
    )

    class Meta:
        ordering = [
            "-fecha_pago",
            "-id",
        ]

        verbose_name = "liquidación de carpidas"
        verbose_name_plural = "liquidaciones de carpidas"

        constraints = [
            models.CheckConstraint(
                condition=Q(
                    fecha_hasta__gte=F(
                        "fecha_desde"
                    )
                ),
                name=(
                    "liquidacion_carpida_"
                    "periodo_valido"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"Liquidación carpidas #{self.pk} - "
            f"${self.total}"
        )


# ============================================================
# DETALLE LIQUIDACION CARPIDA
# ============================================================


class DetalleLiquidacionCarpida(
    BaseAbstractWithUser
):
    """
    Representa una carpida incluida en una liquidación.

    Se guardan los datos económicos como snapshot para
    conservar exactamente lo que fue pagado, aunque luego
    cambie el valor del jornal o cualquier configuración.

    Una carpida solamente puede pertenecer a una
    liquidación activa.
    """

    liquidacion = models.ForeignKey(
        LiquidacionCarpida,
        on_delete=models.PROTECT,
        related_name="detalles",
        verbose_name="liquidación",
    )

    jornal_carpida = models.ForeignKey(
        "gestion.JornalCarpida",
        on_delete=models.PROTECT,
        related_name="detalles_liquidacion",
        verbose_name="jornal de carpida",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    tipo_jornada = models.CharField(
        max_length=20,
        verbose_name="tipo de jornada",
    )

    valor_jornal_aplicado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            ),
        ],
        verbose_name="valor jornal aplicado",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.00")
            ),
        ],
        verbose_name="importe",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Meta:
        ordering = [
            "fecha",
            "id",
        ]

        verbose_name = (
            "detalle de liquidación de carpida"
        )

        verbose_name_plural = (
            "detalles de liquidaciones de carpidas"
        )

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "jornal_carpida",
                ],
                condition=Q(
                    is_deleted=False,
                ),
                name=(
                    "unique_jornal_carpida_"
                    "liquidado_activo"
                ),
            ),
        ]

    def __str__(self):
        return (
            f"Carpida #{self.jornal_carpida_id} - "
            f"{self.fecha} - "
            f"${self.importe}"
        )