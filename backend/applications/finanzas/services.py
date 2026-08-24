from decimal import Decimal

from applications.finanzas.models import (
    CuentaFinanciera,
    MovimientoFinanciero,
)


def calcular_saldos_movimientos(
    movimientos_objetivo,
):
    """
    Calcula los saldos resultantes de varios movimientos
    en una sola pasada.

    Devuelve:

    {
        movimiento_id: {
            "origen": Decimal | None,
            "destino": Decimal | None,
        }
    }
    """

    movimientos_objetivo = list(
        movimientos_objetivo
    )

    if not movimientos_objetivo:
        return {}


    ids_objetivo = {
        movimiento.id
        for movimiento
        in movimientos_objetivo
    }


    # ========================================================
    # SALDOS INICIALES DE TODAS LAS CUENTAS
    # ========================================================

    cuentas = (
        CuentaFinanciera.objects
        .filter(
            is_deleted=False,
        )
        .only(
            "id",
            "saldo_inicial",
        )
    )


    saldos = {
        cuenta.id: (
            cuenta.saldo_inicial
            or Decimal("0.00")
        )
        for cuenta in cuentas
    }


    # ========================================================
    # HASTA QUÉ MOVIMIENTO HAY QUE CALCULAR
    # ========================================================

    ultimo_movimiento = max(
        movimientos_objetivo,
        key=lambda movimiento: (
            movimiento.fecha,
            movimiento.id,
        ),
    )


    # ========================================================
    # HISTORIAL
    # ========================================================

    movimientos_historicos = (
        MovimientoFinanciero.objects
        .filter(
            is_deleted=False,
            fecha__lte=ultimo_movimiento.fecha,
        )
        .only(
            "id",
            "fecha",
            "tipo",
            "monto",
            "cuenta_origen_id",
            "cuenta_destino_id",
        )
        .order_by(
            "fecha",
            "id",
        )
    )


    resultado = {}


    # ========================================================
    # RECORRER UNA SOLA VEZ
    # ========================================================

    for movimiento in movimientos_historicos:

        saldo_origen = None
        saldo_destino = None


        # ----------------------------------------------------
        # INGRESO
        # ----------------------------------------------------

        if (
            movimiento.tipo
            == MovimientoFinanciero.Tipo.INGRESO
        ):

            if movimiento.cuenta_destino_id:

                cuenta_id = (
                    movimiento.cuenta_destino_id
                )

                saldos[cuenta_id] = (
                    saldos.get(
                        cuenta_id,
                        Decimal("0.00"),
                    )
                    + movimiento.monto
                )

                saldo_destino = (
                    saldos[cuenta_id]
                )


        # ----------------------------------------------------
        # GASTO
        # ----------------------------------------------------

        elif (
            movimiento.tipo
            == MovimientoFinanciero.Tipo.GASTO
        ):

            if movimiento.cuenta_origen_id:

                cuenta_id = (
                    movimiento.cuenta_origen_id
                )

                saldos[cuenta_id] = (
                    saldos.get(
                        cuenta_id,
                        Decimal("0.00"),
                    )
                    - movimiento.monto
                )

                saldo_origen = (
                    saldos[cuenta_id]
                )


        # ----------------------------------------------------
        # TRANSFERENCIA
        # ----------------------------------------------------

        elif (
            movimiento.tipo
            == MovimientoFinanciero.Tipo.TRANSFERENCIA
        ):

            if movimiento.cuenta_origen_id:

                cuenta_id = (
                    movimiento.cuenta_origen_id
                )

                saldos[cuenta_id] = (
                    saldos.get(
                        cuenta_id,
                        Decimal("0.00"),
                    )
                    - movimiento.monto
                )

                saldo_origen = (
                    saldos[cuenta_id]
                )


            if movimiento.cuenta_destino_id:

                cuenta_id = (
                    movimiento.cuenta_destino_id
                )

                saldos[cuenta_id] = (
                    saldos.get(
                        cuenta_id,
                        Decimal("0.00"),
                    )
                    + movimiento.monto
                )

                saldo_destino = (
                    saldos[cuenta_id]
                )


        # ----------------------------------------------------
        # GUARDAR SOLO LOS QUE VA A DEVOLVER LA API
        # ----------------------------------------------------

        if movimiento.id in ids_objetivo:

            resultado[
                movimiento.id
            ] = {
                "origen": saldo_origen,
                "destino": saldo_destino,
            }


    return resultado