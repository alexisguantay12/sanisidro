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


class ValorJornal(BaseAbstractWithUser):
    valor = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        verbose_name="valor del jornal",
    )

    vigente_desde = models.DateField(
        verbose_name="vigente desde"
    )

    activo = models.BooleanField(
        default=True,
        verbose_name="activo",
    )

    class Meta:
        ordering = ["-vigente_desde", "-id"]
        verbose_name = "Valor del jornal"
        verbose_name_plural = "Valores del jornal"

    def __str__(self):
        return f"${self.valor} desde {self.vigente_desde}"



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


