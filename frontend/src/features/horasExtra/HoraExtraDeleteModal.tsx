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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="w-full rounded-t-[30px] bg-white shadow-2xl sm:max-w-md sm:rounded-[30px]">

        <div className="flex justify-end px-4 pt-4">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <div className="px-6 pb-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>


          <h2 className="mt-5 text-xl font-semibold text-[#1B1E1C]">
            Eliminar hora extra
          </h2>


          <p className="mt-2 text-sm leading-6 text-[#69716C]">
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
                {horaExtra.cantidad_horas}
                {" "}
                {horaExtra.cantidad_horas === 1
                  ? "hora"
                  : "horas"}
              </span>

              <span className="text-[#A0A7A2]">
                ·
              </span>

              <span className="text-[#69716C]">
                {horaExtra.motivo_display}
              </span>

            </div>

          </div>


          <p className="mt-4 text-xs leading-5 text-[#8A938D]">
            Solo se pueden eliminar registros pendientes de pago.
            La baja se realizará de forma lógica y quedará registrada
            para auditoría.
          </p>


          <div className="mt-6 flex gap-3">

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
              className="h-12 flex-1 rounded-xl bg-red-600 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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