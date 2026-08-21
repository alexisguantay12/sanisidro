import { useEffect, useMemo, useState } from "react";
import { Clock3, Minus, Plus, X } from "lucide-react";

import type { HoraExtra } from "./types";

import { updateHoraExtra } from "./api";


interface Props {
  open: boolean;
  horaExtra: HoraExtra | null;

  onClose: () => void;
  onSuccess: () => void;
}


function money(value: string | number) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(Number(value));
}


function formatDate(fecha: string) {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(`${fecha}T12:00:00`)
  );
}


export default function HoraExtraEditModal({
  open,
  horaExtra,
  onClose,
  onSuccess,
}: Props) {

  const [horas, setHoras] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    if (!horaExtra) {
      return;
    }

    setHoras(
      horaExtra.cantidad_horas
    );

    setError("");

  }, [horaExtra, open]);


  const nuevoTotal =
    useMemo(() => {

      if (!horaExtra) {
        return 0;
      }

      return (
        Number(horaExtra.valor_hora) *
        horas
      );

    }, [horaExtra, horas]);


  if (!open || !horaExtra) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {

      setLoading(true);
      setError("");

      await updateHoraExtra(
        horaExtra.id,
        horas
      );

      onSuccess();
      onClose();

    } catch (error: any) {

      console.error(error);

      const detail =
        error?.response?.data?.detail;

      setError(
        detail ??
        "No se pudo actualizar el registro."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="w-full rounded-t-[30px] bg-white shadow-2xl sm:max-w-md sm:rounded-[30px]">

        <div className="flex items-start justify-between border-b border-black/5 px-5 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A837D]">
              Horas extra
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Editar horas
            </h2>
          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5"
        >

          <div className="rounded-2xl bg-[#F4F6F4] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E4ECE6] text-[#18392B]">
                <Clock3 size={21} />
              </div>

              <div>

                <p className="font-semibold text-[#1B1E1C]">
                  {horaExtra.peon_nombre}
                </p>

                <p className="mt-1 text-sm text-[#727B75]">
                  {formatDate(
                    horaExtra.fecha
                  )}
                  {" · "}
                  {horaExtra.motivo_display}
                </p>

              </div>

            </div>

          </div>


          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="text-sm font-semibold text-[#343A36]">
                Cantidad de horas
              </label>

              <span className="text-xs font-medium text-[#8A938D]">
                1 a 14
              </span>

            </div>


            <div className="flex items-center justify-between rounded-2xl border border-[#E0E5E1] bg-[#FAFBFA] p-2">

              <button
                type="button"
                disabled={horas <= 1}
                onClick={() =>
                  setHoras((current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#4F5852] shadow-sm disabled:opacity-30"
              >
                <Minus size={20} />
              </button>


              <div className="text-center">

                <p className="text-3xl font-semibold tracking-tight text-[#18392B]">
                  {horas}
                </p>

                <p className="text-xs font-medium text-[#7A837D]">
                  {horas === 1
                    ? "hora"
                    : "horas"}
                </p>

              </div>


              <button
                type="button"
                disabled={horas >= 14}
                onClick={() =>
                  setHoras((current) =>
                    Math.min(
                      14,
                      current + 1
                    )
                  )
                }
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF2ED] text-[#18392B] disabled:opacity-30"
              >
                <Plus size={20} />
              </button>

            </div>

          </div>


          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-2xl border border-[#E2E7E3] bg-white p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-[#8A938D]">
                Valor / hora
              </p>

              <p className="mt-2 text-lg font-semibold text-[#1B1E1C]">
                {money(
                  horaExtra.valor_hora
                )}
              </p>

            </div>


            <div className="rounded-2xl bg-[#18392B] p-4 text-white">

              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Nuevo total
              </p>

              <p className="mt-2 text-lg font-semibold">
                {money(nuevoTotal)}
              </p>

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
              className="h-12 flex-1 rounded-xl border border-[#DDE3DE] bg-white font-semibold text-[#56605A]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                horas ===
                  horaExtra.cantidad_horas
              }
              className="h-12 flex-1 rounded-xl bg-[#18392B] font-semibold text-white shadow-[0_8px_24px_rgba(24,57,43,0.18)] transition hover:bg-[#204A38] disabled:cursor-not-allowed disabled:opacity-50"
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