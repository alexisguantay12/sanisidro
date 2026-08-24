import {
  Trash2,
  X,
} from "lucide-react";

import type {
  JornalCarpida,
} from "./types";


interface Props {

  open: boolean;

  jornal: JornalCarpida | null;

  loading: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}


function formatDate(
  value: string
) {

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00Z`
    )
  );
}


export default function JornalCarpidaDeleteModal({
  open,
  jornal,
  loading,
  onCancel,
  onConfirm,
}: Props) {

  if (
    !open ||
    !jornal
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="w-full rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">

        <div className="flex items-start justify-between px-5 pb-0 pt-5 sm:px-6 sm:pt-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={22} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#8A938D] hover:bg-[#F4F6F4]"
          >
            <X size={20} />
          </button>

        </div>


        <div className="px-5 pb-6 pt-4 sm:px-6">

          <h2 className="text-xl font-semibold text-[#1B1E1C]">
            Eliminar registro
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#757E78]">
            ¿Querés eliminar el jornal de carpida
            del{" "}
            <span className="font-semibold text-[#404743]">
              {formatDate(
                jornal.fecha
              )}
            </span>
            ?
          </p>


          <div className="mt-4 rounded-2xl bg-[#F6F8F6] p-4">

            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#929A95]">
              Jornada
            </p>

            <p className="mt-1 text-sm font-semibold text-[#333936]">
              {
                jornal.tipo_jornada_display
              }
            </p>

          </div>


          <p className="mt-4 text-xs leading-5 text-[#8A938D]">
            Esta acción eliminará el registro pendiente.
          </p>


          <div className="mt-6 flex gap-3">

            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm font-semibold text-[#59615C]"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="h-12 flex-1 rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
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