import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clock3,
  X,
} from "lucide-react";

import {
  createTractorSergio,
  getConfiguracionTractor,
} from "./api";


interface Props {
  open: boolean;
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


function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


export default function TractorCreateSergioModal({
  open,
  onClose,
  onSuccess,
}: Props) {

  const [fecha, setFecha] =
    useState(today());

  const [horas, setHoras] =
    useState("");

  const [observacion, setObservacion] =
    useState("");

  const [valorHora, setValorHora] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingConfig, setLoadingConfig] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    if (!open) {
      return;
    }

    setFecha(today());
    setHoras("");
    setObservacion("");
    setError("");

    async function loadConfig() {
      try {
        setLoadingConfig(true);

        const config =
          await getConfiguracionTractor();

        setValorHora(
          config
            ? Number(
                config.valor_hora_sergio
              )
            : null
        );

      } catch (error) {
        console.error(error);

        setValorHora(null);

      } finally {
        setLoadingConfig(false);
      }
    }

    loadConfig();

  }, [open]);


  const total = useMemo(() => {
    if (!valorHora) {
      return 0;
    }

    return (
      Number(horas || 0) *
      valorHora
    );

  }, [horas, valorHora]);


  if (!open) {
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

      await createTractorSergio({
        fecha,
        cantidad_horas: cantidad,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5">

      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:max-w-lg sm:rounded-[28px]">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EDF0EE] bg-white px-5 py-5 sm:px-6">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Tractor · Sergio
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Nueva carga
            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#747D77] transition hover:bg-[#F3F5F3]"
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
              className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-semibold text-[#444B47]">
              Cantidad de horas
            </label>

            <div className="relative">

              <Clock3
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929A95]"
              />

              <input
                type="number"
                min={1}
                max={50}
                step="0.5"
                required
                placeholder="Ej. 5"
                value={horas}
                onChange={(e) =>
                  setHoras(
                    e.target.value
                  )
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />

            </div>

            <p className="mt-2 text-xs text-[#828B85]">
              Mínimo 1 · Máximo 50 horas
            </p>

          </div>


          <div>

            <label className="mb-2 block text-sm font-semibold text-[#444B47]">
              Observación
            </label>

            <textarea
              rows={3}
              placeholder="Detalle del trabajo realizado..."
              value={observacion}
              onChange={(e) =>
                setObservacion(
                  e.target.value
                )
              }
              className="w-full resize-none rounded-2xl border border-[#DDE3DF] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
            />

          </div>


          <div className="rounded-[20px] bg-[#F4F7F5] p-4">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
                  Valor hora
                </p>

                <p className="mt-1 font-semibold text-[#1B1E1C]">
                  {loadingConfig
                    ? "Cargando..."
                    : valorHora
                      ? money(valorHora)
                      : "Sin configurar"}
                </p>

              </div>


              <div className="text-right">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
                  Total
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
              className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F8F7]"
            >
              Cancelar
            </button>


            <button
              type="submit"
              disabled={
                loading ||
                loadingConfig ||
                !valorHora
              }
              className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38] disabled:cursor-not-allowed disabled:opacity-50"
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