import {
  AlertTriangle,
  X,
} from "lucide-react";

import type {
  Venta,
} from "./types";

interface Props {
  open: boolean;
  venta: Venta | null;

  loading: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteVentaModal({
  open,
  venta,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  if (
    !open ||
    !venta
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="w-full rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">
        <div className="flex items-start justify-between border-b border-black/5 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
              Confirmación
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Dar de baja
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={
              loading
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <div className="p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle
              size={24}
            />
          </div>

          <p className="mt-5 text-sm leading-6 text-[#59615C]">
            ¿Querés dar de
            baja la venta de{" "}
            <strong className="font-semibold text-[#1B1E1C]">
              {
                venta.comprador_nombre
              }
            </strong>
            ?
          </p>

          <p className="mt-2 text-sm leading-6 text-[#7A837D]">
            La venta dejará
            de aparecer en
            los listados
            activos.
          </p>
        </div>

        <div className="border-t border-black/5 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-5">
          <div className="flex gap-3">
            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                onCancel
              }
              className="h-12 flex-1 rounded-xl border border-[#E0E5E1] font-semibold text-[#59615C]"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                onConfirm
              }
              className="h-12 flex-1 rounded-xl bg-red-600 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {loading
                ? "Procesando..."
                : "Dar de baja"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}