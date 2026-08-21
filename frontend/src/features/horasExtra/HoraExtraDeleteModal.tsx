import {
  AlertTriangle,
  X,
} from "lucide-react";

import type { HoraExtra } from "./types";

interface Props {
  open: boolean;
  horaExtra: HoraExtra | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function formatDate(fecha: string) {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(`${fecha}T12:00:00`)
  );
}

export default function HoraExtraDeleteModal({
  open,
  horaExtra,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  if (!open || !horaExtra) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div
        className="
          flex w-full flex-col
          max-h-[90dvh]
          rounded-t-[28px]
          bg-white
          shadow-2xl
          sm:max-h-[90vh]
          sm:max-w-md
          sm:rounded-[28px]
        "
      >
        {/* HEADER */}
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
              Confirmación
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Eliminar hora extra
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <p className="mt-5 text-sm leading-6 text-[#69716C]">
            ¿Querés eliminar este registro de horas extra?
          </p>

          <div className="mt-5 rounded-2xl border border-[#E5E9E6] bg-[#FAFBFA] p-4">
            <p className="font-semibold text-[#1B1E1C]">
              {horaExtra.peon_nombre}
            </p>

            <p className="mt-1 text-sm text-[#737C76]">
              {formatDate(
                horaExtra.fecha
              )}
            </p>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="font-semibold text-[#303632]">
                {horaExtra.cantidad_horas}{" "}
                {horaExtra.cantidad_horas ===
                1
                  ? "hora"
                  : "horas"}
              </span>

              <span className="text-[#A0A7A2]">
                ·
              </span>

              <span className="text-[#69716C]">
                {
                  horaExtra.motivo_display
                }
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-[#8A938D]">
            Solo se pueden eliminar registros pendientes de pago.
            La baja se realizará de forma lógica y quedará registrada
            para auditoría.
          </p>
        </div>

        {/* FOOTER */}
        <div
          className="
            shrink-0
            border-t border-black/5
            bg-white
            px-5
            pt-3
            pb-[calc(env(safe-area-inset-bottom)+16px)]
            sm:pb-5
          "
        >
          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="h-12 flex-1 rounded-xl border border-[#DDE3DE] bg-white font-semibold text-[#56605A] transition hover:bg-[#F7F8F6] disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="h-12 flex-1 rounded-xl bg-red-600 font-semibold text-white shadow-[0_8px_24px_rgba(220,38,38,0.18)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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