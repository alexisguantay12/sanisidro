import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  Sprout,
  X,
} from "lucide-react";

import {
  createJornalCarpida,
} from "./api";

import type {
  TipoJornadaCarpida,
} from "./types";


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


export default function JornalCarpidaCreateModal({
  open,
  onClose,
  onSuccess,
}: Props) {

  const [
    fecha,
    setFecha,
  ] = useState(today());

  const [
    tipoJornada,
    setTipoJornada,
  ] = useState<TipoJornadaCarpida>(
    "DIA"
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


  useEffect(() => {

    if (!open) {
      return;
    }

    setFecha(today());
    setTipoJornada("DIA");
    setObservacion("");
    setError("");

  }, [open]);


  if (!open) {
    return null;
  }


  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      setLoading(true);
      setError("");

      await createJornalCarpida({
        fecha,
        tipo_jornada:
          tipoJornada,
        observacion:
          observacion.trim(),
      });

      onSuccess();

    } catch (error: any) {

      console.error(error);

      const data =
        error?.response?.data;

      setError(
        data?.fecha?.[0] ??
        data?.tipo_jornada?.[0] ??
        data?.detail ??
        "No se pudo registrar el jornal de carpida."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]">

        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-[#EEF1EF] px-5 py-5 sm:px-6">

          <div className="flex gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2ED] text-[#18392B]">
              <Sprout size={21} />
            </div>

            <div>

              <h2 className="text-lg font-semibold text-[#1B1E1C]">
                Nueva carpida
              </h2>

              <p className="mt-1 text-sm text-[#7D8680]">
                Registrá un día o medio día de trabajo.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#8A938D] transition hover:bg-[#F4F6F4] hover:text-[#333936]"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {/* FECHA */}
          <div>

            <label className="mb-2 block text-sm font-semibold text-[#414844]">
              Fecha
            </label>

            <div className="relative">

              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929A95]"
              />

              <input
                type="date"
                required
                value={fecha}
                onChange={(e) =>
                  setFecha(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] pl-11 pr-4 text-sm text-[#333936] outline-none transition focus:border-[#9FB4A6] focus:bg-white focus:ring-4 focus:ring-[#18392B]/5"
              />

            </div>

          </div>


          {/* TIPO */}
          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold text-[#414844]">
              Jornada
            </label>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setTipoJornada(
                    "DIA"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  tipoJornada ===
                  "DIA"
                    ? "border-[#18392B] bg-[#EEF3EF] ring-1 ring-[#18392B]"
                    : "border-[#DDE3DF] bg-white hover:bg-[#FAFBFA]"
                }`}
              >
                <p className="text-sm font-semibold text-[#242925]">
                  Día completo
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7D8680]">
                  Equivale a dos jornales
                </p>
              </button>


              <button
                type="button"
                onClick={() =>
                  setTipoJornada(
                    "MEDIO_DIA"
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  tipoJornada ===
                  "MEDIO_DIA"
                    ? "border-[#18392B] bg-[#EEF3EF] ring-1 ring-[#18392B]"
                    : "border-[#DDE3DF] bg-white hover:bg-[#FAFBFA]"
                }`}
              >
                <p className="text-sm font-semibold text-[#242925]">
                  Medio día
                </p>

                <p className="mt-1 text-xs leading-5 text-[#7D8680]">
                  Equivale a un jornal
                </p>
              </button>

            </div>

          </div>


          {/* OBSERVACION */}
          <div className="mt-5">

            <label className="mb-2 block text-sm font-semibold text-[#414844]">
              Observación
            </label>

            <textarea
              value={observacion}
              onChange={(e) =>
                setObservacion(
                  e.target.value
                )
              }
              maxLength={255}
              rows={3}
              placeholder="Observación opcional..."
              className="w-full resize-none rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] px-4 py-3 text-sm text-[#333936] outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:bg-white focus:ring-4 focus:ring-[#18392B]/5"
            />

          </div>


          {/* INFO */}
          <div className="mt-5 rounded-2xl bg-[#F5F7F5] p-4">

            <p className="text-xs font-medium leading-5 text-[#778079]">
              El importe se calculará automáticamente
              según el valor del jornal vigente
              para la fecha seleccionada.
            </p>

          </div>


          {/* ACTIONS */}
          <div className="mt-6 flex gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F9F7]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 flex-1 rounded-2xl bg-[#18392B] px-4 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Guardando..."
                : "Registrar"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}