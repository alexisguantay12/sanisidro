from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from decimal import Decimal

# Ajustá este import según dónde tengas BaseAbstractWithUser
from applications.core.models import BaseAbstractWithUser


# ============================================================
# GRUPO FINANCIERO
# ============================================================


class GrupoFinanciero(BaseAbstractWithUser):

    class Tipo(models.TextChoices):
        INGRESO = "INGRESO", "Ingreso"
        EGRESO = "EGRESO", "Egreso"
        MIXTO = "MIXTO", "Mixto"

    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre",
    )

    tipo = models.CharField(
        max_length=10,
        choices=Tipo.choices,
        default=Tipo.MIXTO,
        verbose_name="Tipo",
    )

    descripcion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Descripción",
    )

    activo = models.BooleanField(
        default=True,
        verbose_name="Activo",
    )

    class Meta:
        ordering = [
            "nombre",
        ]

        verbose_name = (
            "Grupo financiero"
        )

        verbose_name_plural = (
            "Grupos financieros"
        )

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "nombre",
                ],
                condition=Q(
                    is_deleted=False
                ),
                name=(
                    "unique_grupo_financiero_"
                    "activo"
                ),
            ),
        ]

    def __str__(self):
        return self.nombre


# ============================================================
# CATEGORIA FINANCIERA
# ============================================================


class CategoriaFinanciera(
    BaseAbstractWithUser
):

    grupo = models.ForeignKey(
        GrupoFinanciero,
        on_delete=models.PROTECT,
        related_name="categorias",
        verbose_name="Grupo",
        null=True,
        blank=True,
    )

    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre",
    )

    descripcion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Descripción",
    )

    activo = models.BooleanField(
        default=True,
        verbose_name="Activo",
    )

    class Meta:
        ordering = [
            "grupo__nombre",
            "nombre",
        ]

        verbose_name = (
            "Categoría financiera"
        )

        verbose_name_plural = (
            "Categorías financieras"
        )

        constraints = [
            models.UniqueConstraint(
                fields=[ 
                    "nombre",
                ],
                condition=Q(
                    is_deleted=False
                ),
                name=(
                    "unique_categoria_financiera_" 
                ),
            ),
        ]

    def __str__(self):
        return (
            f"{self.grupo.nombre} - "
            f"{self.nombre}"
        )


# ============================================================
# CUENTA FINANCIERA
# ============================================================


class CuentaFinanciera(
    BaseAbstractWithUser
):

    class Tipo(models.TextChoices):
        BANCO = (
            "BANCO",
            "Banco",
        )

        BILLETERA = (
            "BILLETERA",
            "Billetera virtual",
        )

        EFECTIVO = (
            "EFECTIVO",
            "Efectivo",
        )

        TARJETA = (
            "TARJETA",
            "Tarjeta",
        )

        OTRO = (
            "OTRO",
            "Otro",
        )

    nombre = models.CharField(
        max_length=100,
        verbose_name="Nombre",
    )

    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
        default=Tipo.BILLETERA,
        verbose_name="Tipo de cuenta",
    )

    saldo_inicial = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        default=Decimal("0.00"),
        verbose_name="Saldo inicial",
    )

    descripcion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Descripción",
    )

    activa = models.BooleanField(
        default=True,
        verbose_name="Activa",
    )

    class Meta:
        ordering = [
            "nombre",
        ]

        verbose_name = (
            "Cuenta financiera"
        )

        verbose_name_plural = (
            "Cuentas financieras"
        )

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "nombre",
                ],
                condition=Q(
                    is_deleted=False
                ),
                name=(
                    "unique_cuenta_financiera_"
                    "activa"
                ),
            ),
        ]

    def __str__(self):
        return self.nombre


# ============================================================
# MOVIMIENTO FINANCIERO
# ============================================================


class MovimientoFinanciero(
    BaseAbstractWithUser
):

    class Tipo(models.TextChoices):
        INGRESO = (
            "INGRESO",
            "Ingreso",
        )

        GASTO = (
            "GASTO",
            "Gasto",
        )

        TRANSFERENCIA = (
            "TRANSFERENCIA",
            "Transferencia",
        )

    fecha = models.DateField(
        verbose_name="Fecha",
        db_index=True,
    )

    descripcion = models.CharField(
        max_length=255,
        verbose_name="Descripción",
    )

    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices,
        verbose_name="Tipo de movimiento",
        db_index=True,
    )

    monto = models.DecimalField(
        max_digits=16,
        decimal_places=2,
        validators=[
            MinValueValidator(
                Decimal("0.01")
            ),
        ],
        verbose_name="Monto",
    )

    categoria = models.ForeignKey(
        CategoriaFinanciera,
        on_delete=models.PROTECT,
        related_name="movimientos",
        null=True,
        blank=True,
        verbose_name="Categoría",
    )

    cuenta_origen = models.ForeignKey(
        CuentaFinanciera,
        on_delete=models.PROTECT,
        related_name="movimientos_salida",
        null=True,
        blank=True,
        verbose_name="Cuenta origen",
    )

    cuenta_destino = models.ForeignKey(
        CuentaFinanciera,
        on_delete=models.PROTECT,
        related_name="movimientos_entrada",
        null=True,
        blank=True,
        verbose_name="Cuenta destino",
    )

    observacion = models.CharField(
        max_length=255,
        blank=True,
        default="",
        verbose_name="Observación",
    )

    class Meta:
        ordering = [
            "-fecha",
            "-id",
        ]

        verbose_name = (
            "Movimiento financiero"
        )

        verbose_name_plural = (
            "Movimientos financieros"
        )

        indexes = [
            models.Index(
                fields=[
                    "fecha",
                    "tipo",
                ],
            ),
            models.Index(
                fields=[
                    "cuenta_origen",
                    "fecha",
                ],
            ),
            models.Index(
                fields=[
                    "cuenta_destino",
                    "fecha",
                ],
            ),
            models.Index(
                fields=[
                    "categoria",
                    "fecha",
                ],
            ),
        ]

    def clean(self):

        super().clean()

        errors = {}

        # ====================================================
        # INGRESO
        # ====================================================

        if self.tipo == self.Tipo.INGRESO:

            if not self.cuenta_destino:
                errors[
                    "cuenta_destino"
                ] = (
                    "Un ingreso debe tener "
                    "una cuenta destino."
                )

            if self.cuenta_origen:
                errors[
                    "cuenta_origen"
                ] = (
                    "Un ingreso no debe tener "
                    "una cuenta origen."
                )

            if not self.categoria:
                errors[
                    "categoria"
                ] = (
                    "Un ingreso debe tener "
                    "una categoría."
                )

            if (
                self.categoria
                and self.categoria.grupo
                and self.categoria.grupo.tipo
                == GrupoFinanciero.Tipo.EGRESO
            ):
                errors[
                    "categoria"
                ] = (
                    "La categoría seleccionada "
                    "pertenece a un grupo "
                    "exclusivamente de egresos."
                )

        # ====================================================
        # GASTO
        # ====================================================

        elif self.tipo == self.Tipo.GASTO:

            if not self.cuenta_origen:
                errors[
                    "cuenta_origen"
                ] = (
                    "Un gasto debe tener "
                    "una cuenta origen."
                )

            if self.cuenta_destino:
                errors[
                    "cuenta_destino"
                ] = (
                    "Un gasto no debe tener "
                    "una cuenta destino."
                )

            if not self.categoria:
                errors[
                    "categoria"
                ] = (
                    "Un gasto debe tener "
                    "una categoría."
                )

            if (
                self.categoria
                and self.categoria.grupo
                and self.categoria.grupo.tipo
                == GrupoFinanciero.Tipo.INGRESO
            ):
                errors[
                    "categoria"
                ] = (
                    "La categoría seleccionada "
                    "pertenece a un grupo "
                    "exclusivamente de ingresos."
                )

        # ====================================================
        # TRANSFERENCIA
        # ====================================================

        elif (
            self.tipo
            == self.Tipo.TRANSFERENCIA
        ):

            if not self.cuenta_origen:
                errors[
                    "cuenta_origen"
                ] = (
                    "Una transferencia debe "
                    "tener una cuenta origen."
                )

            if not self.cuenta_destino:
                errors[
                    "cuenta_destino"
                ] = (
                    "Una transferencia debe "
                    "tener una cuenta destino."
                )

            if (
                self.cuenta_origen
                and self.cuenta_destino
                and self.cuenta_origen_id
                == self.cuenta_destino_id
            ):
                errors[
                    "cuenta_destino"
                ] = (
                    "La cuenta destino debe "
                    "ser diferente a la "
                    "cuenta origen."
                )

            # Una transferencia no es
            # ingreso ni gasto.
            if self.categoria:
                errors[
                    "categoria"
                ] = (
                    "Una transferencia no "
                    "debe tener categoría."
                )

        if errors:
            raise ValidationError(
                errors
            )

    def __str__(self):

        return (
            f"{self.fecha} - "
            f"{self.get_tipo_display()} - "
            f"{self.descripcion} - "
            f"${self.monto}"
        )