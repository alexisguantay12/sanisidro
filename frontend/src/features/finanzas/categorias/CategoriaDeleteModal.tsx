import type {
  CategoriaFinanciera,
} from "../types";


interface Props {
  open: boolean;

  categoria:
    | CategoriaFinanciera
    | null;

  loading: boolean;

  onCancel: () => void;

  onConfirm: () => void;
}


export default function CategoriaDeleteModal({
  open,
  categoria,
  loading,
  onCancel,
  onConfirm,
}: Props) {

  if (
    !open ||
    !categoria
  ) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/35 sm:items-center sm:p-4">

      <div className="w-full rounded-t-[28px] bg-white p-5 sm:max-w-md sm:rounded-[28px] sm:p-6">

        <h2 className="text-xl font-semibold">
          Eliminar categoría
        </h2>


        <p className="mt-2 text-sm text-[#747D77]">
          ¿Querés eliminar{" "}
          <strong>
            {categoria.nombre}
          </strong>
          ?
        </p>


        <p className="mt-3 text-xs text-[#909893]">
          Si la categoría tiene movimientos asociados,
          la eliminación puede ser rechazada.
        </p>


        <div className="mt-6 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-12 rounded-2xl border border-[#DDE3DF] font-semibold text-[#59615C] disabled:opacity-60"
          >
            Cancelar
          </button>


          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="h-12 rounded-2xl bg-red-600 font-semibold text-white disabled:opacity-60"
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