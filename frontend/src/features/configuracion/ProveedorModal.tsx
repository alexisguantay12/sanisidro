import {
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  createProveedor,
  updateProveedor,
} from "./api";

import type {
  Proveedor,
} from "./types";

interface Props {
  open: boolean;
  proveedor: Proveedor | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProveedorModal({
  open,
  proveedor,
  onClose,
  onSuccess,
}: Props) {
  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    activo,
    setActivo,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const editing = Boolean(
    proveedor
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setNombre(
      proveedor?.nombre ?? ""
    );

    setObservacion(
      proveedor?.observacion ?? ""
    );

    setActivo(
      proveedor?.activo ?? true
    );

    setError("");
  }, [
    open,
    proveedor,
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
        "Ingresá el nombre del proveedor."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = {
        nombre: nombre.trim(),
        observacion:
          observacion.trim(),
        activo,
      };

      if (
        editing &&
        proveedor
      ) {
        await updateProveedor(
          proveedor.id,
          data
        );
      } else {
        await createProveedor(
          data
        );
      }

      onClose();
      await onSuccess();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data
          ?.detail ??
          "No se pudo guardar el proveedor."
      );
    } finally {
      setLoading(false);
    }
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
          sm:max-w-lg
          sm:rounded-[28px]
        "
      >
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Configuración · Proveedores
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              {editing
                ? "Editar proveedor"
                : "Nuevo proveedor"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#747D77] transition hover:bg-[#F3F5F3] disabled:opacity-50"
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
                placeholder="Nombre del proveedor"
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
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
                className="w-full resize-none rounded-2xl border border-[#DDE3DF] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#E2E7E3] bg-[#FAFBFA] p-4">
              <div>
                <p className="text-sm font-semibold text-[#444B47]">
                  Proveedor activo
                </p>

                <p className="mt-1 text-xs text-[#88918B]">
                  Los proveedores inactivos
                  no deberían utilizarse en
                  nuevos registros.
                </p>
              </div>

              <input
                type="checkbox"
                checked={activo}
                onChange={(e) =>
                  setActivo(
                    e.target.checked
                  )
                }
                disabled={loading}
                className="h-5 w-5 accent-[#18392B]"
              />
            </label>
          </div>

          <div
            className="
              shrink-0
              border-t border-black/5
              bg-white
              px-5
              pt-3
              pb-[calc(env(safe-area-inset-bottom)+16px)]
              sm:px-6
              sm:pb-5
            "
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F8F7] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38] disabled:opacity-50"
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