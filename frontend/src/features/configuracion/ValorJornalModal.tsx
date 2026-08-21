import {
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  createValorJornal,
} from "./api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export default function ValorJornalModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [
    valor,
    setValor,
  ] = useState("");

  const [
    fecha,
    setFecha,
  ] = useState(today());

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setValor("");
    setFecha(today());
    setError("");
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const numero =
      Number(valor);

    if (numero <= 0) {
      setError(
        "El valor debe ser mayor a cero."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createValorJornal({
        valor: numero,
        vigente_desde: fecha,
      });

      onClose();
      await onSuccess();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data
          ?.detail ??
        "No se pudo guardar el valor."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="flex max-h-[90dvh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">
        <div className="flex items-start justify-between border-b border-black/5 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Configuración · Valores
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Nuevo valor de jornal
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#747D77] hover:bg-[#F3F5F3]"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Valor
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={valor}
                onChange={(e) =>
                  setValor(
                    e.target.value
                  )
                }
                placeholder="35000"
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Vigente desde
              </label>

              <input
                type="date"
                required
                value={fecha}
                onChange={(e) =>
                  setFecha(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>

            <div className="rounded-2xl bg-[#F3F6F4] p-4 text-sm leading-6 text-[#68716B]">
              Al guardar este valor pasará
              a ser el jornal activo. El
              valor anterior quedará
              conservado en el historial.
            </div>
          </div>

          <div className="border-t border-black/5 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white"
              >
                {loading
                  ? "Guardando..."
                  : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}