import {
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  createInsumo,
  updateInsumo,
} from "./api";

import type {
  Insumo,
  TipoInsumo,
} from "./types";

interface Props {
  open: boolean;
  insumo: Insumo | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InsumoModal({
  open,
  insumo,
  onClose,
  onSuccess,
}: Props) {
  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    tipo,
    setTipo,
  ] = useState<TipoInsumo>(
    "herbicida"
  );

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const editing =
    Boolean(insumo);

  useEffect(() => {
    if (!open) {
      return;
    }

    setNombre(
      insumo?.nombre ?? ""
    );

    setTipo(
      insumo?.tipo ??
        "herbicida"
    );

    setObservacion(
      insumo?.observacion ?? ""
    );

    setError("");
  }, [
    open,
    insumo,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!nombre.trim()) {
      setError(
        "Ingresá el nombre del insumo."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = {
        nombre: nombre.trim(),
        tipo,
        observacion:
          observacion.trim(),
      };

      if (
        editing &&
        insumo
      ) {
        await updateInsumo(
          insumo.id,
          data
        );
      } else {
        await createInsumo(
          data
        );
      }

      onClose();
      await onSuccess();
    } catch (error: any) {
      console.error(error);

      const nombreError =
        error?.response?.data
          ?.nombre?.[0];

      setError(
        nombreError ??
        error?.response?.data
          ?.detail ??
        "No se pudo guardar el insumo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="flex max-h-[90dvh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-[28px]">
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Configuración · Insumos
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              {editing
                ? "Editar insumo"
                : "Nuevo insumo"}
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
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Nombre
              </label>

              <input
                type="text"
                required
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                placeholder="Ej. Glifosato"
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Tipo
              </label>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(
                    e.target
                      .value as TipoInsumo
                  )
                }
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              >
                <option value="herbicida">
                  Herbicida
                </option>

                <option value="plaguicida">
                  Plaguicida
                </option>

                <option value="fungicida">
                  Fungicida
                </option>

                <option value="insecticida">
                  Insecticida
                </option>

                <option value="fertilizante">
                  Fertilizante
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Observación
              </label>

              <textarea
                rows={4}
                value={observacion}
                onChange={(e) =>
                  setObservacion(
                    e.target.value
                  )
                }
                placeholder="Información adicional..."
                disabled={loading}
                className="w-full resize-none rounded-2xl border border-[#DDE3DF] px-4 py-3 text-sm outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-black/5 bg-white px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:px-6 sm:pb-5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)]"
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