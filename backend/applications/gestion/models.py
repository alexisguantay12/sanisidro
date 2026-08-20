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

    observacion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="observación",
    )

    class Meta:
        ordering = ["-fecha", "peon__nombre"]

        verbose_name = "Tarja"
        verbose_name_plural = "Tarjas"

        constraints = [
            models.UniqueConstraint(
                fields=["peon", "fecha"],
                condition=Q(is_deleted=False),
                name="unique_tarja_activa_peon_fecha",
            )
        ]

    def __str__(self):
        return f"{self.peon} - {self.fecha} - {self.get_fraccion_display()}"



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