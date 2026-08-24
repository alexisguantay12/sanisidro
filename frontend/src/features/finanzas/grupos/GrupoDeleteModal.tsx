import type {
  GrupoFinanciero,
} from "../types";


interface Props {
  open: boolean;
  grupo:
    | GrupoFinanciero
    | null;

  loading: boolean;

  onCancel: () => void;
  onConfirm: () => void;
}


export default function GrupoDeleteModal({
  open,
  grupo,
  loading,
  onCancel,
  onConfirm,
}: Props) {

  if (
    !open ||
    !grupo
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/35 sm:items-center sm:p-4">

      <div className="w-full rounded-t-[28px] bg-white p-5 sm:max-w-md sm:rounded-[28px] sm:p-6">

        <h2 className="text-xl font-semibold">
          Eliminar grupo
        </h2>

        <p className="mt-2 text-sm text-[#747D77]">
          ¿Eliminar{" "}
          <strong>
            {grupo.nombre}
          </strong>
          ?
        </p>

        <p className="mt-3 text-xs text-[#909893]">
          Si tiene categorías relacionadas, el backend puede impedir la eliminación.
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
            Eliminar
          </button>

        </div>

      </div>

    </div>
  );
}