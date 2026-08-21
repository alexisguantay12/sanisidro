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

export default function ConfigDeleteModal({
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
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
              Confirmación
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#777F7A] transition hover:bg-[#F3F5F3] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={23} />
          </div>

          <p className="mt-5 text-sm leading-6 text-[#737C76]">
            {description}{" "}
            Esta acción quitará el
            registro del sistema.
          </p>
        </div>

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
              onClick={onCancel}
              disabled={loading}
              className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F8F7] disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="h-12 flex-1 rounded-2xl bg-red-600 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(220,38,38,0.18)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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