from django.db import models

from applications.core.models import BaseAbstractWithUser


class Peon(BaseAbstractWithUser):
    nombre = models.CharField(
        max_length=120,
        verbose_name="nombre"
    )

    activo = models.BooleanField(
        default=True,
        verbose_name="activo"
    )

    class Meta:
        ordering = ["nombre"]
        verbose_name = "Peón"
        verbose_name_plural = "Peones"

    def __str__(self):
        return self.nombre



from django.db import models
from django.db.models import Q

from applications.core.models import BaseAbstractWithUser


class Peon(BaseAbstractWithUser):
    nombre = models.CharField(
        max_length=120,
        verbose_name="nombre"
    )

    activo = models.BooleanField(
        default=True,
        verbose_name="activo"
    )

    class Meta:
        ordering = ["nombre"]
        verbose_name = "Peón"
        verbose_name_plural = "Peones"

    def __str__(self):
        return self.nombre

class Tarja(BaseAbstractWithUser):

    class Fraccion(models.TextChoices):
        COMPLETO = "1.0", "Día completo"
        MEDIO = "0.5", "Medio día"

    class Tarea(models.TextChoices):
        PLANTACION = "plantacion", "Plantación"
        CARPIDA = "carpida", "Carpida"
        CULTIVADA = "cultivada", "Cultivada"
        RIEGO = "riego", "Riego"
        COSECHA = "cosecha", "Cosecha"
        EMBOLSADO = "embolsado", "Embolsado"
        CARGA = "carga", "Carga"
        PALEADA = "paleada", "Paleada"
        OTRO = "otro", "Otro"

    class Destino(models.TextChoices):
        SAN_ISIDRO = (
            "san_isidro",
            "San Isidro",
        )

        EXTERNO = (
            "externo",
            "Externo",
        )

    peon = models.ForeignKey(
        Peon,
        on_delete=models.PROTECT,
        related_name="tarjas",
        verbose_name="peón",
    )

    fecha = models.DateField(
        verbose_name="fecha"
    )

    fraccion = models.CharField(
        max_length=3,
        choices=Fraccion.choices,
        verbose_name="jornal",
    )

    tarea = models.CharField(
        max_length=30,
        choices=Tarea.choices,
        blank=True,
        default="",
        verbose_name="tarea",
    )

    destino = models.CharField(
        max_length=20,
        choices=Destino.choices,
        default=Destino.SAN_ISIDRO,
        verbose_name="destino",
    )

    destinatario = models.ForeignKey(
        Peon,
        on_delete=models.PROTECT,
        related_name="tarjas_recibidas",
        null=True,
        blank=True,
        verbose_name="destinatario",
    )

    observacion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Meta:
        ordering = [
            "-fecha",
            "peon__nombre",
        ]

        verbose_name = "Tarja"
        verbose_name_plural = "Tarjas"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "peon",
                    "fecha",
                ],
                condition=Q(
                    is_deleted=False
                ),
                name=(
                    "unique_tarja_"
                    "activa_peon_fecha"
                ),
            )
        ]

    def __str__(self):
        return (
            f"{self.peon} - "
            f"{self.fecha} - "
            f"{self.get_fraccion_display()}"
        )


from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from applications.core.models import BaseAbstractWithUser


class ValorJornal(
    BaseAbstractWithUser
):

    valor = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ],
        verbose_name="valor del jornal",
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

    activo = models.BooleanField(
        default=True,
        verbose_name="activo",
    )

    class Meta:

        ordering = [
            "-vigente_desde",
            "-id",
        ]

        verbose_name = (
            "Valor del jornal"
        )

        verbose_name_plural = (
            "Valores del jornal"
        )

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
                    "valor_jornal_"
                    "vigencia_valida"
                ),
            ),
        ]

    def clean(self):

        super().clean()

        if (
            self.vigente_hasta
            and
            self.vigente_hasta
            <
            self.vigente_desde
        ):
            raise ValidationError({
                "vigente_hasta": (
                    "La fecha hasta no "
                    "puede ser anterior "
                    "a la fecha desde."
                )
            })

    def __str__(self):

        hasta = (
            self.vigente_hasta
            if self.vigente_hasta
            else "actualidad"
        )

        return (
            f"${self.valor} "
            f"desde "
            f"{self.vigente_desde} "
            f"hasta {hasta}"
        )



class HoraExtra(BaseAbstractWithUser):

    class Motivo(models.TextChoices):
        RIEGO = "riego", "Riego"
        COSECHA = "cosecha", "Cosecha"
        FUMIGACION = "fumigacion", "Fumigación"
        OTRO = "otro", "Otro"

    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente de pago"
        LIQUIDADA = "liquidada", "Liquidada"

    peon = models.ForeignKey(
        "gestion.Peon",
        on_delete=models.PROTECT,
        related_name="horas_extras",
        verbose_name="peón",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    cantidad_horas = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(14),
        ],
        verbose_name="cantidad de horas",
    )

    motivo = models.CharField(
        max_length=20,
        choices=Motivo.choices,
        verbose_name="motivo",
    )

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
        verbose_name="estado",
    )

    valor_jornal_aplicado = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="valor del jornal aplicado",
    )

    valor_hora = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="valor por hora",
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="total",
    )

    class Meta:
        ordering = ["-fecha", "-id"]
        verbose_name = "Hora extra"
        verbose_name_plural = "Horas extra"

    def __str__(self):
        return (
            f"{self.peon} - {self.fecha} - "
            f"{self.cantidad_horas} h"
        )






from decimal import Decimal

from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


# Ajustar este import a tu proyecto
from applications.core.models import BaseAbstractWithUser


# ============================================================
# PROVEEDOR
# ============================================================


class Proveedor(BaseAbstractWithUser):
    nombre = models.CharField(
        max_length=150,
        verbose_name="Nombre",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="Observación",
    )

    activo = models.BooleanField(
        default=True,
        verbose_name="Activo",
    )

    class Meta:
        verbose_name = "Proveedor"
        verbose_name_plural = "Proveedores"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


# ============================================================
# CONFIGURACION TRACTOR SERGIO
# ============================================================


class ConfiguracionTractor(BaseAbstractWithUser):
    """
    Configuración del valor por hora del tractor de Sergio.

    Idealmente habrá un único registro activo.
    """

    valor_hora_sergio = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="Valor hora Sergio",
    )

    class Meta:
        verbose_name = "Configuración Tractor"
        verbose_name_plural = "Configuración Tractor"

    def __str__(self):
        return f"Hora Sergio: ${self.valor_hora_sergio}"


# ============================================================
# TRACTOR SERGIO
# ============================================================


class TractorSergio(BaseAbstractWithUser):

    ESTADO_PENDIENTE = "pendiente"
    ESTADO_PAGADA = "pagada"

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, "Pendiente"),
        (ESTADO_PAGADA, "Pagada"),
    ]

    fecha = models.DateField(
        verbose_name="Fecha",
    )

    cantidad_horas = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("1")),
            MaxValueValidator(Decimal("50")),
        ],
        verbose_name="Cantidad de horas",
    )

    valor_hora = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="Valor hora",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Importe",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="Observación",
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=ESTADO_PENDIENTE,
        db_index=True,
        verbose_name="Estado",
    )

    class Meta:
        verbose_name = "Tractor Sergio"
        verbose_name_plural = "Tractor Sergio"
        ordering = ["-fecha", "-id"]

    def __str__(self):
        return (
            f"{self.fecha} - "
            f"{self.cantidad_horas} hs - "
            f"${self.importe}"
        )

    def save(self, *args, **kwargs):
        """
        El importe SIEMPRE se calcula en backend.
        """

        self.importe = (
            Decimal(str(self.cantidad_horas))
            * Decimal(str(self.valor_hora))
        )

        super().save(*args, **kwargs)


# ============================================================
# TRACTOR TERCEROS
# ============================================================


class TractorTercero(BaseAbstractWithUser):

    ESTADO_PENDIENTE = "pendiente"
    ESTADO_PAGADA = "pagada"

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, "Pendiente"),
        (ESTADO_PAGADA, "Pagada"),
    ]

    fecha = models.DateField(
        verbose_name="Fecha",
    )

    proveedor = models.ForeignKey(
        Proveedor,
        on_delete=models.PROTECT,
        related_name="trabajos_tractor",
        verbose_name="Proveedor",
    )

    cantidad_horas = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("1")),
            MaxValueValidator(Decimal("50")),
        ],
        verbose_name="Cantidad de horas",
    )

    precio_hora = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.01")),
        ],
        verbose_name="Precio por hora",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Importe",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="Observación",
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=ESTADO_PENDIENTE,
        db_index=True,
        verbose_name="Estado",
    )

    class Meta:
        verbose_name = "Tractor Tercero"
        verbose_name_plural = "Tractores Terceros"
        ordering = ["-fecha", "-id"]

    def __str__(self):
        return (
            f"{self.fecha} - "
            f"{self.proveedor.nombre} - "
            f"{self.cantidad_horas} hs"
        )

    def save(self, *args, **kwargs):
        """
        El importe SIEMPRE se calcula en backend.
        """

        self.importe = (
            Decimal(str(self.cantidad_horas))
            * Decimal(str(self.precio_hora))
        )

        super().save(*args, **kwargs)




class Insumo(BaseAbstractWithUser):
    TIPO_HERBICIDA = "herbicida"
    TIPO_PLAGUICIDA = "plaguicida"
    TIPO_FUNGICIDA = "fungicida"
    TIPO_INSECTICIDA = "insecticida"
    TIPO_FERTILIZANTE = "fertilizante"

    TIPO_CHOICES = [
        (TIPO_HERBICIDA, "Herbicida"),
        (TIPO_PLAGUICIDA, "Plaguicida"),
        (TIPO_FUNGICIDA, "Fungicida"),
        (TIPO_INSECTICIDA, "Insecticida"),
        (TIPO_FERTILIZANTE, "Fertilizante"),
    ]

    nombre = models.CharField(
        max_length=150,
        unique=True,
    )

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
    )

    observacion = models.TextField(
        blank=True,
        default="",
    )

    class Meta:
        ordering = ["nombre"]
        verbose_name = "Insumo"
        verbose_name_plural = "Insumos"

    def __str__(self):
        return self.nombre


class ConsumoInsumo(BaseAbstractWithUser):
    UNIDAD_LITRO = "l"
    UNIDAD_GRAMO = "g"
    UNIDAD_KILOGRAMO = "kg"
    UNIDAD_MILILITRO = "ml"
    UNIDAD_UNIDAD = "unidad"

    UNIDAD_CHOICES = [
        (UNIDAD_LITRO, "Litros"),
        (UNIDAD_GRAMO, "Gramos"),
        (UNIDAD_KILOGRAMO, "Kilogramos"),
        (UNIDAD_MILILITRO, "Mililitros"),
        (UNIDAD_UNIDAD, "Unidad"),
    ]

    fecha_aplicacion = models.DateField()

    insumo = models.ForeignKey(
        Insumo,
        on_delete=models.PROTECT,
        related_name="consumos",
    )

    cantidad = models.IntegerField()

    unidad = models.CharField(
        max_length=10,
        choices=UNIDAD_CHOICES,
    )

    observacion = models.TextField(
        blank=True,
        default="",
    )

    class Meta:
        ordering = ["-fecha_aplicacion", "-id"]
        verbose_name = "Consumo de insumo"
        verbose_name_plural = "Consumos de insumos"

    def __str__(self):
        return (
            f"{self.fecha_aplicacion} - "
            f"{self.insumo.nombre} - "
            f"{self.cantidad} {self.get_unidad_display()}"
        )






from decimal import Decimal

from django.core.validators import MinValueValidator
from django.db import models

# Importá BaseAbstractWithUser desde donde lo tengas.
# Si está en este mismo archivo, NO agregues este import.
#
# from .base_models import BaseAbstractWithUser


class ConfiguracionAlmacigo(BaseAbstractWithUser):
    valor = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("65000.00"),
        validators=[
            MinValueValidator(Decimal("0.01"))
        ],
        verbose_name="valor del almácigo",
    )

    class Meta:
        verbose_name = "configuración de almácigo"
        verbose_name_plural = "configuración de almácigos"

    def __str__(self):
        return f"Valor almácigo: ${self.valor}"


class Almacigo(BaseAbstractWithUser):
    ESTADO_PENDIENTE = "PENDIENTE"
    ESTADO_PAGADA = "PAGADA"

    ESTADOS = [
        (
            ESTADO_PENDIENTE,
            "Pendiente",
        ),
        (
            ESTADO_PAGADA,
            "Pagada",
        ),
    ]

    fecha = models.DateField(
        verbose_name="fecha",
    )

    cantidad = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1)
        ],
        verbose_name="cantidad",
    )

    observacion = models.TextField(
        blank=True,
        default="",
        verbose_name="observación",
    )

    valor_unitario = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ],
        verbose_name="valor unitario",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            )
        ],
        verbose_name="importe",
    )

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default=ESTADO_PENDIENTE,
        db_index=True,
        verbose_name="estado",
    )

    class Meta:
        ordering = [
            "-fecha",
            "-id",
        ]
        verbose_name = "almácigo"
        verbose_name_plural = "almácigos"

    def __str__(self):
        return (
            f"{self.fecha} - "
            f"{self.cantidad} - "
            f"${self.importe}"
        )



from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
 

class Comprador(BaseAbstractWithUser):
    nombre = models.CharField(
        max_length=150,
        verbose_name="nombre",
    )

    cuit = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        unique=True,
        verbose_name="CUIT",
    )

    telefono = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        verbose_name="teléfono",
    )

    observacion = models.TextField(
        null=True,
        blank=True,
        verbose_name="observación",
    )

    class Meta:
        verbose_name = "comprador"
        verbose_name_plural = "compradores"
        ordering = ["nombre"]

    def __str__(self):
        return self.nombre


class Venta(BaseAbstractWithUser):

    class Estado(models.TextChoices):
        PENDIENTE = "PENDIENTE", "Pendiente"
        PARCIAL = "PARCIAL", "Parcial"
        PAGADA = "PAGADA", "Pagada"

    comprador = models.ForeignKey(
        Comprador,
        on_delete=models.PROTECT,
        related_name="ventas",
        verbose_name="comprador",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    cantidad_bolsas = models.IntegerField(
        verbose_name="cantidad de bolsas",
    )

    precio_unitario = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        verbose_name="precio unitario",
    )

    observacion = models.TextField(
        null=True,
        blank=True,
        verbose_name="observación",
    )

    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.PENDIENTE,
        editable=False,
        verbose_name="estado",
    )

    class Meta:
        verbose_name = "venta"
        verbose_name_plural = "ventas"
        ordering = ["-fecha", "-id"]

    def __str__(self):
        return (
            f"Venta #{self.pk} - "
            f"{self.comprador} - "
            f"{self.cantidad_bolsas} bolsas"
        )

    @property
    def total(self):
        return (
            Decimal(self.cantidad_bolsas)
            * self.precio_unitario
        )

    @property
    def cantidad_bolsas_pagadas(self):
        resultado = self.pagos.filter(
            is_deleted=False,
        ).aggregate(
            total=Sum("cantidad_bolsas")
        )

        return resultado["total"] or 0

    @property
    def cantidad_bolsas_pendientes(self):
        pagadas = self.cantidad_bolsas_pagadas

        return max(
            self.cantidad_bolsas - pagadas,
            0,
        )

    @property
    def total_pagado(self):
        resultado = self.pagos.filter(
            is_deleted=False,
        ).aggregate(
            total=Sum("importe")
        )

        return resultado["total"] or Decimal("0.00")

    @property
    def saldo_pendiente(self):
        saldo = self.total - self.total_pagado

        return max(
            saldo,
            Decimal("0.00"),
        )

    def actualizar_estado(self):
        pagadas = self.cantidad_bolsas_pagadas

        if pagadas <= 0:
            nuevo_estado = self.Estado.PENDIENTE

        elif pagadas >= self.cantidad_bolsas:
            nuevo_estado = self.Estado.PAGADA

        else:
            nuevo_estado = self.Estado.PARCIAL

        if self.estado != nuevo_estado:
            self.estado = nuevo_estado

            self.save(
                update_fields=[
                    "estado",
                ]
            )

        return nuevo_estado


class PagoVenta(BaseAbstractWithUser):
    venta = models.ForeignKey(
        Venta,
        on_delete=models.PROTECT,
        related_name="pagos",
        verbose_name="venta",
    )

    fecha = models.DateField(
        verbose_name="fecha",
    )

    cantidad_bolsas = models.IntegerField(
        verbose_name="cantidad de bolsas pagadas",
    )

    importe = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        editable=False,
        verbose_name="importe",
    )

    observacion = models.TextField(
        null=True,
        blank=True,
        verbose_name="observación",
    )

    class Meta:
        verbose_name = "pago de venta"
        verbose_name_plural = "pagos de ventas"
        ordering = ["-fecha", "-id"]

    def __str__(self):
        return (
            f"Pago #{self.pk} - "
            f"Venta #{self.venta_id} - "
            f"{self.cantidad_bolsas} bolsas"
        )

    def clean(self):
        super().clean()

        if not self.venta_id:
            return

        if self.cantidad_bolsas < 1:
            raise ValidationError(
                {
                    "cantidad_bolsas": (
                        "La cantidad de bolsas debe ser mayor a 0."
                    )
                }
            )

        pagos = self.venta.pagos.filter(
            is_deleted=False,
        )

        if self.pk:
            pagos = pagos.exclude(pk=self.pk)

        ya_pagadas = pagos.aggregate(
            total=Sum("cantidad_bolsas")
        )["total"] or 0

        disponibles = (
            self.venta.cantidad_bolsas
            - ya_pagadas
        )

        if self.cantidad_bolsas > disponibles:
            raise ValidationError(
                {
                    "cantidad_bolsas": (
                        f"Solo quedan {disponibles} bolsas "
                        "pendientes de pago."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        self.importe = (
            Decimal(self.cantidad_bolsas)
            * self.venta.precio_unitario
        )

        super().save(*args, **kwargs)