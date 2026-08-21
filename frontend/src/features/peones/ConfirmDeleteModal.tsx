import {
  AlertTriangle,
  X,
} from "lucide-react";


interface Props {
  open: boolean;
  nombre: string;
  loading: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}


export default function ConfirmDeleteModal({
  open,
  nombre,
  loading,
  onCancel,
  onConfirm,
}: Props) {

  if (!open) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">

      <div className="w-full rounded-t-3xl bg-white shadow-xl sm:max-w-md sm:rounded-3xl">

        <div className="flex justify-end p-3">

          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <div className="px-6 pb-6">

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            Dar de baja
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            ¿Querés dar de baja a{" "}
            <strong>{nombre}</strong>?
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            El peón dejará de aparecer en las nuevas cargas,
            pero sus registros históricos se conservarán.
          </p>


          <div className="mt-6 flex gap-3">

            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="h-12 flex-1 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="h-12 flex-1 rounded-xl bg-red-600 font-medium text-white hover:bg-red-700 disabled:opacity-60"
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