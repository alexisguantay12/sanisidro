import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  createComprador,
  updateComprador,
} from "./api";

import type {
  Comprador,
} from "./types";

interface Props {
  open: boolean;
  comprador?: Comprador | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompradorModal({
  open,
  comprador,
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
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (comprador) {
      setNombre(
        comprador.nombre
      );

      setObservacion(
        comprador.observacion ?? ""
      );
    } else {
      setNombre("");
      setObservacion("");
    }

    setError("");
  }, [
    comprador,
    open,
  ]);

  if (!open) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const nombreLimpio =
      nombre.trim();

    const observacionLimpia =
      observacion.trim();

    if (!nombreLimpio) {
      setError(
        "Ingresá el nombre del comprador."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = {
        nombre: nombreLimpio,
        observacion:
          observacionLimpia,
      };

      if (comprador) {
        await updateComprador(
          comprador.id,
          data
        );
      } else {
        await createComprador(
          data
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(
        "Error guardando comprador",
        error
      );

      setError(
        "No se pudo guardar el comprador. Intentá nuevamente."
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
          sm:max-w-md
          sm:rounded-[28px]
        "
      >
        {/* HEADER */}
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A837D]">
              Ventas
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              {comprador
                ? "Editar comprador"
                : "Nuevo comprador"}
            </h2>

            <p className="mt-1 text-sm text-[#7A837D]">
              {comprador
                ? "Modificá los datos del comprador."
                : "Agregá un comprador para utilizarlo en ventas."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
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

        <form
          onSubmit={
            handleSubmit
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* CONTENIDO */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-semibold text-[#343A36]"
              >
                Nombre
              </label>

              <input
                id="nombre"
                autoFocus
                type="text"
                placeholder="Ej: Juan Pérez"
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                disabled={
                  loading
                }
                className="
                  h-12 w-full
                  rounded-xl
                  border border-[#E0E5E1]
                  bg-white
                  px-4
                  text-base
                  outline-none
                  transition
                  focus:border-[#18392B]
                  focus:ring-2
                  focus:ring-[#18392B]/10
                  disabled:bg-slate-50
                  disabled:text-slate-500
                "
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="observacion"
                className="mb-2 block text-sm font-semibold text-[#343A36]"
              >
                Observación
              </label>

              <textarea
                id="observacion"
                rows={4}
                placeholder="Información adicional del comprador..."
                value={
                  observacion
                }
                onChange={(e) =>
                  setObservacion(
                    e.target.value
                  )
                }
                disabled={
                  loading
                }
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border border-[#E0E5E1]
                  bg-white
                  px-4 py-3
                  text-base
                  outline-none
                  transition
                  focus:border-[#18392B]
                  focus:ring-2
                  focus:ring-[#18392B]/10
                  disabled:bg-slate-50
                  disabled:text-slate-500
                "
              />
            </div>

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
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
                  onClose
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
                type="submit"
                disabled={
                  loading
                }
                className="
                  h-12 flex-1
                  rounded-xl
                  bg-[#18392B]
                  font-semibold
                  text-white
                  shadow-[0_8px_24px_rgba(24,57,43,0.18)]
                  transition
                  hover:bg-[#204A38]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
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