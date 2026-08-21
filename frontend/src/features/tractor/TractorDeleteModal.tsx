import {
  AlertTriangle,
  X,
} from "lucide-react";


interface Props {
  open: boolean;
  title: string;
  description: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}


export default function TractorDeleteModal({
  open,
  title,
  description,
  loading,
  onCancel,
  onConfirm,
}: Props) {

  if (!open) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center sm:p-5">

      <div className="w-full rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-[28px] sm:p-6">

        <div className="flex items-start justify-between gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={23} />
          </div>


          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#777F7A] hover:bg-[#F3F5F3]"
          >
            <X size={20} />
          </button>

        </div>


        <h2 className="mt-5 text-xl font-semibold text-[#1B1E1C]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#737C76]">
          {description}
          {" "}
          Esta acción quitará el registro del listado.
        </p>


        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C]"
          >
            Cancelar
          </button>


          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-12 flex-1 rounded-2xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
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