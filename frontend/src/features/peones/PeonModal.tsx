import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  createPeon,
  updatePeon,
} from "./api";

import type { Peon } from "./types";


interface Props {
  open: boolean;
  peon?: Peon | null;

  onClose: () => void;
  onSuccess: () => void;
}


export default function PeonModal({
  open,
  peon,
  onClose,
  onSuccess,
}: Props) {

  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    if (peon) {
      setNombre(peon.nombre);
    } else {
      setNombre("");
    }

    setError("");
  }, [peon, open]);


  if (!open) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      setError("Ingresá el nombre del peón.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (peon) {
        await updatePeon(
          peon.id,
          {
            nombre: nombreLimpio,
          }
        );
      } else {
        await createPeon({
          nombre: nombreLimpio,
          activo: true,
        });
      }

      onSuccess();
      onClose();

    } catch (error) {
      console.error(error);

      setError(
        "No se pudo guardar el peón. Intentá nuevamente."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">

      <div className="w-full rounded-t-3xl bg-white shadow-xl sm:max-w-md sm:rounded-3xl">

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {peon
                ? "Editar peón"
                : "Nuevo peón"}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {peon
                ? "Modificá los datos del trabajador."
                : "Agregá un trabajador a la campaña."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >

          <div>
            <label
              htmlFor="nombre"
              className="mb-2 block text-sm font-medium text-slate-700"
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
                setNombre(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />

            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>


          <div className="flex gap-3">

            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 flex-1 rounded-xl bg-slate-900 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Guardando..."
                : "Guardar"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}