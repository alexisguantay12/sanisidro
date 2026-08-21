import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  updateTractorTercero,
} from "./api";

import type {
  Proveedor,
  TractorTercero,
} from "./types";


interface Props {
  open: boolean;
  registro: TractorTercero | null;
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


export default function TractorEditTerceroModal({
  open,
  registro,
  proveedores,
  onClose,
  onSuccess,
}: Props) {

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
    if (!registro) {
      return;
    }

    setProveedor(
      String(registro.proveedor)
    );

    setHoras(
      String(
        Number(
          registro.cantidad_horas
        )
      )
    );

    setPrecioHora(
      String(
        Number(
          registro.precio_hora
        )
      )
    );

    setObservacion(
      registro.observacion ?? ""
    );

    setError("");

  }, [registro]);


  const total = useMemo(
    () =>
      Number(horas || 0) *
      Number(precioHora || 0),

    [horas, precioHora]
  );


  if (!open || !registro) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      if (!registro) return  
      await updateTractorTercero(
        registro.id,
        {
          proveedor:
            Number(proveedor),

          cantidad_horas:
            Number(horas),

          precio_hora:
            Number(precioHora),

          observacion:
            observacion.trim(),
        }
      );

      onClose();

      await onSuccess();

    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ??
        "No se pudo actualizar el registro."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center sm:p-5">

      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]">

        <div className="flex items-center justify-between border-b border-[#EDF0EE] px-5 py-5 sm:px-6">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Tractor · Terceros
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Editar trabajo
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
              Proveedor
            </label>

            <select
              value={proveedor}
              required
              onChange={(e) =>
                setProveedor(
                  e.target.value
                )
              }
              className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            >
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
              className="w-full resize-none rounded-2xl border border-[#DDE3DF] px-4 py-3 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            />
          </div>


          <div className="rounded-[20px] bg-[#F4F7F5] p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
              Nuevo importe
            </p>

            <p className="mt-1 text-xl font-semibold text-[#18392B]">
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
                : "Guardar cambios"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}