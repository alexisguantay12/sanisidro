import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

import type { Peon } from "../peones/types";
import type { MotivoHoraExtra } from "./types";

import { createHoraExtra } from "./api";


interface Props {
  open: boolean;
  peones: Peon[];

  onClose: () => void;
  onSuccess: () => void;
}


const motivos: Array<{
  value: MotivoHoraExtra;
  label: string;
}> = [
  {
    value: "riego",
    label: "Riego",
  },
  {
    value: "cosecha",
    label: "Cosecha",
  },
  {
    value: "fumigacion",
    label: "Fumigación",
  },
  {
    value: "otro",
    label: "Otro",
  },
];


export default function HoraExtraCreateModal({
  open,
  peones,
  onClose,
  onSuccess,
}: Props) {

  const [peonId, setPeonId] =
    useState<number | null>(null);

  const [fecha, setFecha] =
    useState("");

  const [horas, setHoras] =
    useState(1);

  const [motivo, setMotivo] =
    useState<MotivoHoraExtra>("riego");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    if (!open) {
      return;
    }

    const hoy =
      new Date()
        .toISOString()
        .split("T")[0];

    setPeonId(null);
    setFecha(hoy);
    setHoras(1);
    setMotivo("riego");
    setError("");

  }, [open]);


  if (!open) {
    return null;
  }


  function decreaseHours() {
    setHoras((current) =>
      Math.max(1, current - 1)
    );
  }


  function increaseHours() {
    setHoras((current) =>
      Math.min(14, current + 1)
    );
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!peonId) {
      setError("Seleccioná un peón.");
      return;
    }

    if (!fecha) {
      setError("Seleccioná una fecha.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createHoraExtra({
        peon: peonId,
        fecha,
        cantidad_horas: horas,
        motivo,
      });

      onSuccess();
      onClose();

    } catch (error: any) {

      console.error(error);

      const detail =
        error?.response?.data?.detail;

      setError(
        detail ??
        "No se pudo guardar la hora extra."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[30px] bg-white shadow-2xl sm:max-w-md sm:rounded-[30px]">

        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-black/5 bg-white px-5 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A837D]">
              Horas extra
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Nueva carga
            </h2>

            <p className="mt-1 text-sm text-[#6B746E]">
              Registrá las horas trabajadas fuera de jornada.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5"
        >

          <div>

            <label className="mb-2 block text-sm font-semibold text-[#343A36]">
              Peón
            </label>

            <select
              value={peonId ?? ""}
              onChange={(e) =>
                setPeonId(
                  e.target.value
                    ? Number(e.target.value)
                    : null
                )
              }
              className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 text-[#303632] outline-none transition focus:border-[#18392B] focus:ring-4 focus:ring-[#18392B]/5"
            >
              <option value="">
                Seleccionar trabajador
              </option>

              {peones.map((peon) => (
                <option
                  key={peon.id}
                  value={peon.id}
                >
                  {peon.nombre}
                </option>
              ))}
            </select>

          </div>


          <div>

            <label className="mb-2 block text-sm font-semibold text-[#343A36]">
              Fecha
            </label>

            <input
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(e.target.value)
              }
              className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 text-[#303632] outline-none transition focus:border-[#18392B] focus:ring-4 focus:ring-[#18392B]/5"
            />

          </div>


          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-semibold text-[#343A36]">
                Cantidad de horas
              </label>

              <span className="text-xs font-medium text-[#8A938D]">
                Mín. 1 · Máx. 14
              </span>

            </div>


            <div className="flex items-center justify-between rounded-2xl border border-[#E0E5E1] bg-[#FAFBFA] p-2">

              <button
                type="button"
                onClick={decreaseHours}
                disabled={horas <= 1}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#4F5852] shadow-sm transition hover:bg-[#F2F4F2] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Minus size={20} />
              </button>


              <div className="min-w-[90px] text-center">

                <p className="text-3xl font-semibold tracking-tight text-[#18392B]">
                  {horas}
                </p>

                <p className="mt-0.5 text-xs font-medium text-[#7A837D]">
                  {horas === 1
                    ? "hora"
                    : "horas"}
                </p>

              </div>


              <button
                type="button"
                onClick={increaseHours}
                disabled={horas >= 14}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2ED] text-[#18392B] transition hover:bg-[#DCE9E0] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={20} />
              </button>

            </div>

          </div>


          <div>

            <label className="mb-3 block text-sm font-semibold text-[#343A36]">
              Motivo
            </label>

            <div className="grid grid-cols-2 gap-2">

              {motivos.map((item) => {

                const selected =
                  motivo === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setMotivo(item.value)
                    }
                    className={`
                      h-12 rounded-xl border px-3
                      text-sm font-semibold
                      transition
                      ${
                        selected
                          ? "border-[#18392B] bg-[#EAF2ED] text-[#18392B]"
                          : "border-[#E0E5E1] bg-white text-[#59615C] hover:bg-[#F7F8F6]"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                );

              })}

            </div>

          </div>


          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          <div className="flex gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-12 flex-1 rounded-xl border border-[#DDE3DE] bg-white font-semibold text-[#56605A] transition hover:bg-[#F7F8F6] disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 flex-1 rounded-xl bg-[#18392B] font-semibold text-white shadow-[0_8px_24px_rgba(24,57,43,0.18)] transition hover:bg-[#204A38] disabled:cursor-not-allowed disabled:opacity-60"
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