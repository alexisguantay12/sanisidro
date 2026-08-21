import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  createTractorTercero,
} from "./api";

import type {
  Proveedor,
} from "./types";


interface Props {
  open: boolean;
  proveedores: Proveedor[];
  onClose: () => void;
  onSuccess: () => void;
}


function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}


function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


export default function TractorCreateTerceroModal({
  open,
  proveedores,
  onClose,
  onSuccess,
}: Props) {

  const [fecha, setFecha] =
    useState(today());

  const [proveedor, setProveedor] =
    useState("");

  const [horas, setHoras] =
    useState("");

  const [precioHora, setPrecioHora] =
    useState("");

  const [observacion, setObservacion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    if (!open) {
      return;
    }

    setFecha(today());
    setProveedor("");
    setHoras("");
    setPrecioHora("");
    setObservacion("");
    setError("");

  }, [open]);


  const total = useMemo(
    () =>
      Number(horas || 0) *
      Number(precioHora || 0),

    [horas, precioHora]
  );


  if (!open) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const cantidad =
      Number(horas);

    const precio =
      Number(precioHora);

    if (!proveedor) {
      setError(
        "Seleccioná un proveedor."
      );

      return;
    }

    if (
      cantidad < 1 ||
      cantidad > 50
    ) {
      setError(
        "Las horas deben estar entre 1 y 50."
      );

      return;
    }

    if (precio <= 0) {
      setError(
        "El precio por hora debe ser mayor a cero."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      await createTractorTercero({
        fecha,
        proveedor:
          Number(proveedor),
        cantidad_horas:
          cantidad,
        precio_hora:
          precio,
        observacion:
          observacion.trim(),
      });

      onClose();
      await onSuccess();

    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ??
        "No se pudo registrar el trabajo."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center sm:p-5">

      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EDF0EE] bg-white px-5 py-5 sm:px-6">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Tractor · Terceros
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Nuevo trabajo
            </h2>
          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#747D77] hover:bg-[#F3F5F3]"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          <div>
            <label className="mb-2 block text-sm font-semibold text-[#444B47]">
              Fecha
            </label>

            <input
              type="date"
              required
              value={fecha}
              onChange={(e) =>
                setFecha(e.target.value)
              }
              className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-semibold text-[#444B47]">
              Proveedor
            </label>

            <select
              required
              value={proveedor}
              onChange={(e) =>
                setProveedor(
                  e.target.value
                )
              }
              className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            >
              <option value="">
                Seleccionar proveedor...
              </option>

              {proveedores.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nombre}
                  </option>
                )
              )}

            </select>
          </div>


          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Horas
              </label>

              <input
                type="number"
                min={1}
                max={50}
                step="0.5"
                required
                placeholder="5"
                value={horas}
                onChange={(e) =>
                  setHoras(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>


            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Precio / hora
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="35000"
                value={precioHora}
                onChange={(e) =>
                  setPrecioHora(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>

          </div>


          <div>
            <label className="mb-2 block text-sm font-semibold text-[#444B47]">
              Observación
            </label>

            <textarea
              rows={3}
              value={observacion}
              onChange={(e) =>
                setObservacion(
                  e.target.value
                )
              }
              placeholder="Detalle del trabajo..."
              className="w-full resize-none rounded-2xl border border-[#DDE3DF] px-4 py-3 text-sm outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            />
          </div>


          <div className="rounded-[20px] bg-[#18392B] p-4 text-white">

            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              Importe estimado
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {money(total)}
            </p>

          </div>


          <div className="flex gap-3 border-t border-[#EDF0EE] pt-5">

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
              className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white disabled:opacity-50"
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