import {
  Trash2,
  X,
} from "lucide-react";

import type {
  CuentaFinanciera,
} from "../types";


interface Props {
  open: boolean;
  cuenta:
    | CuentaFinanciera
    | null;

  loading: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}


export default function CuentaDeleteModal({
  open,
  cuenta,
  loading,
  onCancel,
  onConfirm,
}: Props) {

  if (
    !open ||
    !cuenta
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/35 sm:items-center sm:p-4">

      <div className="w-full rounded-t-[28px] bg-white p-5 sm:max-w-md sm:rounded-[28px] sm:p-6">

        <div className="flex justify-between">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={21} />
          </div>

          <button
            onClick={onCancel}
            className="h-10 w-10"
          >
            <X size={20} />
          </button>

        </div>

        <h2 className="mt-5 text-xl font-semibold">
          Eliminar cuenta
        </h2>

        <p className="mt-2 text-sm text-[#727B75]">
          ¿Querés eliminar{" "}
          <strong>
            {cuenta.nombre}
          </strong>
          ?
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">

          <button
            onClick={onCancel}
            className="h-12 rounded-2xl border border-[#DDE3DF] font-semibold"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-12 rounded-2xl bg-red-600 font-semibold text-white"
          >
            {loading
              ? "Eliminando..."
              : "Eliminar"}
          </button>

        </div>

      </div>

    </div>
  );
}