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

export default function ConfirmDeleteCompradorModal({
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
              Dar de baja
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-slate-500
              transition
              hover:bg-slate-100
              disabled:opacity-50
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle
              size={24}
            />
          </div>

          <p className="mt-5 text-sm leading-6 text-[#59615C]">
            ¿Querés dar de baja a{" "}
            <strong className="font-semibold text-[#1B1E1C]">
              {nombre}
            </strong>
            ?
          </p>

          <p className="mt-2 text-sm leading-6 text-[#7A837D]">
            El comprador dejará
            de aparecer disponible
            para nuevas ventas,
            pero sus registros
            históricos se
            conservarán.
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
              disabled={
                loading
              }
              onClick={
                onCancel
              }
              className="
                h-12 flex-1
                rounded-xl
                border border-[#E0E5E1]
                bg-white
                font-semibold
                text-[#59615C]
                transition
                hover:bg-slate-50
                disabled:opacity-50
              "
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
              className="
                h-12 flex-1
                rounded-xl
                bg-red-600
                font-semibold
                text-white
                shadow-[0_8px_24px_rgba(220,38,38,0.18)]
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
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