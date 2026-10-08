from rest_framework.exceptions import ValidationError
from decimal import Decimal
from applications.finanzas.models import (
    CategoriaFinanciera,
    MovimientoFinanciero,
)


ORIGEN_LIQUIDACION_PERSONAL = (
    "LIQUIDACION_PERSONAL"
)

def crear_movimiento_liquidacion_personal(
    *,
    liquidacion,
    cuenta,
    usuario,
):
    """
    Crea el movimiento financiero de una liquidación
    de personal.

    Liquidación positiva:
        GASTO -> resta dinero de la cuenta.

    Liquidación negativa:
        INGRESO -> suma dinero a la cuenta.

    El monto del movimiento siempre es positivo.

    Debe ejecutarse dentro de transaction.atomic().
    """

    # ========================================================
    # EVITAR DUPLICADOS
    # ========================================================

    existente = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            origen_modulo=ORIGEN_LIQUIDACION_PERSONAL,
            origen_id=liquidacion.id,
        )
        .first()
    )

    if existente:
        raise ValidationError({
            "movimiento_financiero": (
                "Esta liquidación ya tiene "
                "un movimiento financiero asociado."
            )
        })

    # ========================================================
    # VALIDAR CUENTA
    # ========================================================

    if cuenta is None:
        raise ValidationError({
            "cuenta_financiera": (
                "Debe seleccionar una cuenta financiera."
            )
        })

    if cuenta.is_deleted:
        raise ValidationError({
            "cuenta_financiera": (
                "La cuenta financiera seleccionada "
                "fue eliminada."
            )
        })

    if not cuenta.activa:
        raise ValidationError({
            "cuenta_financiera": (
                "La cuenta financiera seleccionada "
                "se encuentra inactiva."
            )
        })

    # ========================================================
    # VALIDAR IMPORTE
    # ========================================================

    total = Decimal(str(liquidacion.total))

    if total == Decimal("0.00"):
        raise ValidationError({
            "total": (
                "No se puede generar un movimiento "
                "financiero con importe cero."
            )
        })

    # ========================================================
    # DETERMINAR TIPO DE MOVIMIENTO
    # ========================================================

    es_reintegro = total < Decimal("0.00")

    monto = abs(total)

    if es_reintegro:
        tipo = MovimientoFinanciero.Tipo.INGRESO

        cuenta_origen = None
        cuenta_destino = cuenta

        descripcion = (
            f"Reintegro de Personal: "
            f"{liquidacion.peon.nombre}"
        )

    else:
        tipo = MovimientoFinanciero.Tipo.GASTO

        cuenta_origen = cuenta
        cuenta_destino = None

        descripcion = (
            f"Pago a Personal: "
            f"{liquidacion.peon.nombre}"
        )

    # ========================================================
    # CATEGORIA FINANCIERA
    # ========================================================

    categoria = (
        CategoriaFinanciera.objects
        .filter(
            is_deleted=False,
            activo=True,
            nombre__iexact="Sueldos al Personal",
        )
        .first()
    )

    if not categoria:
        raise ValidationError({
            "categoria_financiera": (
                "No existe una categoría financiera "
                "activa llamada 'Sueldos al Personal'."
            )
        })

    # ========================================================
    # CREAR MOVIMIENTO FINANCIERO
    # ========================================================

    movimiento = (
        MovimientoFinanciero.objects.create(
            fecha=liquidacion.fecha_pago,

            descripcion=descripcion,

            tipo=tipo,

            monto=monto,

            categoria=categoria,

            cuenta_origen=cuenta_origen,

            cuenta_destino=cuenta_destino,

            observacion=(
                "Generado automáticamente desde "
                "liquidación de personal "
                f"#{liquidacion.id}. "
                + (
                    "Reintegro por liquidación negativa."
                    if es_reintegro
                    else "Pago de liquidación de personal."
                )
            ),

            origen_modulo=ORIGEN_LIQUIDACION_PERSONAL,

            origen_id=liquidacion.id,

            user_made=usuario,
        )
    )

    return movimiento

ORIGEN_LIQUIDACION_TRACTOR_SERGIO = (
    "LIQUIDACION_TRACTOR_SERGIO"
)

ORIGEN_LIQUIDACION_TRACTOR_TERCERO = (
    "LIQUIDACION_TRACTOR_TERCERO"
)
 
def crear_movimiento_liquidacion_tractor(
    *,
    liquidacion,
    cuenta,
    usuario,
):
    """
    Crea el gasto financiero correspondiente
    a una liquidación de tractor.
    """

    from applications.administracion.models import (
        LiquidacionTractor,
    )

    # ========================================================
    # DETERMINAR ORIGEN Y DESCRIPCIÓN
    # ========================================================

    if (
        liquidacion.tipo
        == LiquidacionTractor.TIPO_SERGIO
    ):
        origen_modulo = (
            ORIGEN_LIQUIDACION_TRACTOR_SERGIO
        )

        descripcion = (
            "Pago tractor - Sergio"
        )

    else:
        origen_modulo = (
            ORIGEN_LIQUIDACION_TRACTOR_TERCERO
        )

        proveedor_nombre = (
            liquidacion.proveedor.nombre
            if liquidacion.proveedor
            else "Tercero"
        )

        descripcion = (
            f"Pago tractor - {proveedor_nombre}"
        )

    # ========================================================
    # EVITAR DUPLICADOS
    # ========================================================

    existente = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            origen_modulo=origen_modulo,
            origen_id=liquidacion.id,
        )
        .first()
    )

    if existente:
        raise ValidationError({
            "movimiento_financiero": (
                "Esta liquidación de tractor "
                "ya tiene un movimiento financiero."
            )
        })

    # ========================================================
    # CATEGORÍA
    # ========================================================

    categoria = (
        CategoriaFinanciera.objects
        .filter(
            is_deleted=False,
            activo=True,
            nombre__iexact="Tractor",
        )
        .first()
    )

    if not categoria:
        raise ValidationError({
            "categoria_financiera": (
                "No existe una categoría financiera "
                "activa llamada 'Tractor'."
            )
        })

    # ========================================================
    # CUENTA
    # ========================================================

    if not cuenta.activa:
        raise ValidationError({
            "cuenta_financiera": (
                "La cuenta financiera seleccionada "
                "se encuentra inactiva."
            )
        })

    # ========================================================
    # MOVIMIENTO
    # ========================================================

    movimiento = (
        MovimientoFinanciero.objects.create(
            fecha=liquidacion.fecha_pago,

            descripcion=descripcion,

            tipo=(
                MovimientoFinanciero
                .Tipo
                .GASTO
            ),

            monto=liquidacion.total,

            categoria=categoria,

            cuenta_origen=cuenta,
            cuenta_destino=None,

            observacion=(
                "Generado automáticamente desde "
                "liquidación de tractor "
                f"#{liquidacion.id}"
            ),

            origen_modulo=origen_modulo,
            origen_id=liquidacion.id,

            user_made=usuario,
        )
    )

    return movimiento




ORIGEN_LIQUIDACION_ALMACIGO = (
    "LIQUIDACION_ALMACIGO"
)
 

def crear_movimiento_liquidacion_almacigo(
    *,
    liquidacion,
    cuenta,
    usuario,
):
    existente = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            origen_modulo=(
                ORIGEN_LIQUIDACION_ALMACIGO
            ),
            origen_id=liquidacion.id,
        )
        .first()
    )

    if existente:
        raise ValidationError({
            "movimiento_financiero": (
                "Esta liquidación de almácigos "
                "ya tiene un movimiento financiero."
            )
        })

    categoria = (
        CategoriaFinanciera.objects
        .filter(
            is_deleted=False,
            activo=True,
            nombre__iexact="Almacigos",
        )
        .first()
    )

    if not categoria:
        raise ValidationError({
            "categoria_financiera": (
                "No existe una categoría financiera "
                "activa llamada 'Almácigos'."
            )
        })

    if not cuenta.activa:
        raise ValidationError({
            "cuenta_financiera": (
                "La cuenta financiera seleccionada "
                "se encuentra inactiva."
            )
        })

    movimiento = (
        MovimientoFinanciero.objects.create(
            fecha=liquidacion.fecha_pago,

            descripcion=(
                "Pago de almácigos"
            ),

            tipo=(
                MovimientoFinanciero
                .Tipo
                .GASTO
            ),

            monto=liquidacion.total,

            categoria=categoria,

            cuenta_origen=cuenta,

            cuenta_destino=None,

            observacion=(
                "Generado automáticamente desde "
                "liquidación de almácigos "
                f"#{liquidacion.id}"
            ),

            origen_modulo=(
                ORIGEN_LIQUIDACION_ALMACIGO
            ),

            origen_id=(
                liquidacion.id
            ),

            user_made=usuario,
        )
    )

    return movimiento





ORIGEN_RENDICION_VENTA = (
    "RENDICION_VENTA"
) 

def crear_movimiento_rendicion_venta(
    *,
    rendicion,
    cuenta,
    usuario,
):
    """
    Crea el ingreso financiero correspondiente
    a una rendición de ventas.

    Debe ejecutarse dentro de transaction.atomic().
    """

    # ========================================================
    # EVITAR DUPLICADOS
    # ========================================================

    existente = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,

            origen_modulo=(
                ORIGEN_RENDICION_VENTA
            ),

            origen_id=(
                rendicion.id
            ),
        )
        .first()
    )

    if existente:
        raise ValidationError({
            "movimiento_financiero": (
                "Esta rendición ya tiene "
                "un movimiento financiero asociado."
            )
        })

    # ========================================================
    # CATEGORIA
    # ========================================================

    categoria = (
        CategoriaFinanciera.objects
        .filter(
            is_deleted=False,
            activo=True,
            nombre__iexact="Ventas",
        )
        .first()
    )

    if not categoria:
        raise ValidationError({
            "categoria_financiera": (
                "No existe una categoría financiera "
                "activa llamada 'Ventas'."
            )
        })

    # ========================================================
    # CUENTA
    # ========================================================

    if not cuenta.activa:
        raise ValidationError({
            "cuenta_financiera": (
                "La cuenta financiera seleccionada "
                "se encuentra inactiva."
            )
        })

    # ========================================================
    # CREAR INGRESO
    # ========================================================

    movimiento = (
        MovimientoFinanciero.objects
        .create(
            fecha=(
                rendicion.fecha
            ),

            descripcion=(
                "Rendición de ventas"
            ),

            tipo=(
                MovimientoFinanciero
                .Tipo
                .INGRESO
            ),

            monto=(
                rendicion.total
            ),

            categoria=(
                categoria
            ),

            # Es un INGRESO:
            cuenta_origen=None,

            cuenta_destino=(
                cuenta
            ),

            observacion=(
                "Generado automáticamente desde "
                "rendición de ventas "
                f"#{rendicion.id}"
            ),

            origen_modulo=(
                ORIGEN_RENDICION_VENTA
            ),

            origen_id=(
                rendicion.id
            ),

            user_made=(
                usuario
            ),
        )
    )

    return movimiento





# ============================================================
# LIQUIDACION DE CARPIDAS
# ============================================================


ORIGEN_LIQUIDACION_CARPIDA = (
    "LIQUIDACION_CARPIDA"
)


def crear_movimiento_liquidacion_carpida(
    *,
    liquidacion,
    cuenta,
    usuario,
):
    """
    Crea el gasto financiero correspondiente
    al pago de una liquidación de carpidas.

    Debe ejecutarse dentro de transaction.atomic()
    desde el módulo de administración.
    """

    # ========================================================
    # EVITAR MOVIMIENTOS DUPLICADOS
    # ========================================================

    existente = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            origen_modulo=(
                ORIGEN_LIQUIDACION_CARPIDA
            ),
            origen_id=liquidacion.id,
        )
        .first()
    )

    if existente:
        raise ValidationError(
            {
                "movimiento_financiero": (
                    "Esta liquidación de carpidas "
                    "ya tiene un movimiento "
                    "financiero asociado."
                )
            }
        )

    # ========================================================
    # CATEGORIA FINANCIERA
    # ========================================================

    categoria = (
        CategoriaFinanciera.objects
        .filter(
            is_deleted=False,
            activo=True,
            nombre__iexact=(
                "Carpidas"
            ),
        )
        .first()
    )

    if not categoria:
        raise ValidationError(
            {
                "categoria_financiera": (
                    "No existe una categoría financiera "
                    "activa llamada 'Carpidas'."
                )
            }
        )

    # ========================================================
    # VALIDAR CUENTA
    # ========================================================

    if not cuenta:
        raise ValidationError(
            {
                "cuenta_financiera": (
                    "Debe seleccionar una cuenta "
                    "financiera de origen."
                )
            }
        )

    if cuenta.is_deleted:
        raise ValidationError(
            {
                "cuenta_financiera": (
                    "La cuenta financiera seleccionada "
                    "fue eliminada."
                )
            }
        )

    if not cuenta.activa:
        raise ValidationError(
            {
                "cuenta_financiera": (
                    "La cuenta financiera seleccionada "
                    "se encuentra inactiva."
                )
            }
        )

    # ========================================================
    # CREAR MOVIMIENTO
    # ========================================================

    movimiento = (
        MovimientoFinanciero.objects
        .create(
            fecha=(
                liquidacion.fecha_pago
            ),

            descripcion=(
                "Pago de carpidas"
            ),

            tipo=(
                MovimientoFinanciero
                .Tipo
                .GASTO
            ),

            monto=(
                liquidacion.total
            ),

            categoria=(
                categoria
            ),

            cuenta_origen=(
                cuenta
            ),

            cuenta_destino=None,

            observacion=(
                "Generado automáticamente desde "
                "liquidación de carpidas "
                f"#{liquidacion.id}"
            ),

            origen_modulo=(
                ORIGEN_LIQUIDACION_CARPIDA
            ),

            origen_id=(
                liquidacion.id
            ),

            user_made=(
                usuario
            ),
        )
    )

    return movimiento