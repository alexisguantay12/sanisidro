import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { X } from "lucide-react";

import {
  updateTractorSergio,
} from "./api";

import type {
  TractorSergio,
} from "./types";


interface Props {
  open: boolean;
  registro: TractorSergio | null;
  onClose: () => void;
  onSuccess: () => void;
}


function money(value: string | number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value));
}


export default function TractorEditSergioModal({
  open,
  registro,
  onClose,
  onSuccess,
}: Props) {

  const [horas, setHoras] =
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

    setHoras(
      String(
        Number(
          registro.cantidad_horas
        )
      )
    );

    setObservacion(
      registro.observacion ?? ""
    );

    setError("");

  }, [registro]);


  const total = useMemo(() => {
    if (!registro) {
      return 0;
    }

    return (
      Number(horas || 0) *
      Number(registro.valor_hora)
    );

  }, [horas, registro]);


  if (!open || !registro) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const cantidad =
      Number(horas);

    if (
      !cantidad ||
      cantidad < 1 ||
      cantidad > 50
    ) {
      setError(
        "Las horas deben estar entre 1 y 50."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      if (!registro) return
      if(registro)
      await updateTractorSergio(
        registro.id,
        {
          cantidad_horas:
            cantidad,

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
              Tractor · Sergio
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
              Cantidad de horas
            </label>

            <input
              type="number"
              min={1}
              max={50}
              step="0.5"
              required
              value={horas}
              onChange={(e) =>
                setHoras(e.target.value)
              }
              className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            />

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

            <div className="flex justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
                  Valor hora
                </p>

                <p className="mt-1 font-semibold">
                  {money(
                    registro.valor_hora
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
                  Nuevo total
                </p>

                <p className="mt-1 text-lg font-semibold text-[#18392B]">
                  {money(total)}
                </p>
              </div>

            </div>

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