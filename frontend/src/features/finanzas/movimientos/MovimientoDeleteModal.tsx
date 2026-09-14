import {
  Trash2,
  X,
} from "lucide-react";

import type {
  MovimientoFinanciero,
} from "../types";


interface Props {
  open: boolean;

  movimiento:
    | MovimientoFinanciero
    | null;

  loading: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}


function money(
  value:
    | string
    | number
    | null
    | undefined,
  currency:
    | "ARS"
    | "USD"
    | null
) {

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency:
        currency === "USD"
          ? "USD"
          : "ARS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(
      value ?? 0
    )
  );
}


export default function MovimientoDeleteModal({
  open,
  movimiento,
  loading,
  onCancel,
  onConfirm,
}: Props) {

  if (
    !open ||
    !movimiento
  ) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="w-full rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">

        <div className="flex items-start justify-between px-5 pt-5 sm:px-6 sm:pt-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <Trash2
              size={22}
            />

          </div>


          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              onCancel
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8A938D]"
          >

            <X
              size={20}
            />

          </button>

        </div>


        <div className="px-5 pb-6 pt-4 sm:px-6">

          <h2 className="text-xl font-semibold text-[#1B1E1C]">
            Eliminar movimiento
          </h2>


          <p className="mt-2 text-sm leading-6 text-[#757E78]">

            ¿Querés eliminar{" "}

            <span className="font-semibold text-[#333936]">
              {
                movimiento.descripcion
              }
            </span>

            ?

          </p>


          {movimiento.tipo ===
          "CAMBIO_MONEDA" ? (

            <div className="mt-4 rounded-2xl bg-[#F6F8F6] p-4">

              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                Cambio de moneda
              </p>


              <div className="mt-3 grid grid-cols-2 gap-3">

                <div>

                  <p className="text-[10px] uppercase text-[#9AA29D]">
                    Sale
                  </p>

                  <p className="mt-1 text-base font-semibold text-red-600">

                    {money(
                      movimiento.monto,
                      movimiento.cuenta_origen_moneda
                    )}

                  </p>

                </div>


                <div>

                  <p className="text-[10px] uppercase text-[#9AA29D]">
                    Entra
                  </p>

                  <p className="mt-1 text-base font-semibold text-emerald-700">

                    {money(
                      movimiento.monto_destino,
                      movimiento.cuenta_destino_moneda
                    )}

                  </p>

                </div>

              </div>


              {movimiento.cotizacion && (

                <div className="mt-3 border-t border-[#E4E9E6] pt-3">

                  <p className="text-xs text-[#7D8780]">
                    Cotización
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#414944]">

                    {money(
                      movimiento.cotizacion,
                      "ARS"
                    )}

                    {" / USD"}

                  </p>

                </div>

              )}

            </div>

          ) : (

            <div className="mt-4 rounded-2xl bg-[#F6F8F6] p-4">

              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                Monto
              </p>

              <p className="mt-1 text-lg font-semibold text-[#333936]">

                {money(
                  movimiento.monto,

                  movimiento.tipo ===
                  "INGRESO"
                    ? movimiento.cuenta_destino_moneda
                    : movimiento.cuenta_origen_moneda
                )}

              </p>

            </div>

          )}


          <p className="mt-4 text-xs leading-5 text-[#8A938D]">
            El saldo de las cuentas se recalculará automáticamente.
          </p>


          <div className="mt-6 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={
                onCancel
              }
              disabled={
                loading
              }
              className="h-12 rounded-2xl border border-[#DDE3DF] bg-white text-sm font-semibold text-[#59615C]"
            >
              Cancelar
            </button>


            <button
              type="button"
              onClick={
                onConfirm
              }
              disabled={
                loading
              }
              className="h-12 rounded-2xl bg-red-600 text-sm font-semibold text-white disabled:opacity-60"
            >

              {loading
                ? "Eliminando..."
                : "Eliminar"}

            </button>

          </div>

        </div>

      </div>

    </div>
  );
}