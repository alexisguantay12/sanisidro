import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Minus,
  Plus,
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

function money(
  value: string | number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(Number(value));
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
    useState(1);

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    valorHora,
    setValorHora,
  ] = useState<number | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingConfig,
    setLoadingConfig,
  ] = useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setFecha(today());
    setHoras(1);
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

  const total =
    useMemo(() => {
      if (!valorHora) {
        return 0;
      }

      return horas * valorHora;
    }, [
      horas,
      valorHora,
    ]);

  if (!open) {
    return null;
  }

  function decreaseHours() {
    setHoras((current) =>
      Math.max(
        0.5,
        Number(
          (
            current - 0.5
          ).toFixed(1)
        )
      )
    );
  }

  function increaseHours() {
    setHoras((current) =>
      Math.min(
        50,
        Number(
          (
            current + 0.5
          ).toFixed(1)
        )
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      horas < 0.5 ||
      horas > 50
    ) {
      setError(
        "Las horas deben estar entre 0,5 y 50."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createTractorSergio({
        fecha,
        cantidad_horas:
          horas,
        observacion:
          observacion.trim(),
      });

      onClose();

      await onSuccess();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data
          ?.detail ??
          "No se pudo registrar el trabajo."
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
        {/* HEADER */}
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5 sm:px-6">
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
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#747D77] transition hover:bg-[#F3F5F3] disabled:opacity-50"
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
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* FECHA */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Fecha
              </label>

              <input
                type="date"
                required
                value={fecha}
                onChange={(e) =>
                  setFecha(
                    e.target.value
                  )
                }
                disabled={
                  loading
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            {/* HORAS */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-[#444B47]">
                  Cantidad de horas
                </label>

                <span className="shrink-0 text-xs font-medium text-[#8A938D]">
                  Mín. 0,5 · Máx. 50
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#E0E5E1] bg-[#FAFBFA] p-2">
                <button
                  type="button"
                  onClick={
                    decreaseHours
                  }
                  disabled={
                    loading ||
                    horas <= 0.5
                  }
                  className="
                    flex h-12 w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-[#4F5852]
                    shadow-sm
                    transition
                    hover:bg-[#F2F4F2]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  <Minus size={20} />
                </button>

                <div className="min-w-[100px] flex-1 text-center">
                  <p className="text-3xl font-semibold tracking-tight text-[#18392B]">
                    {horas.toLocaleString(
                      "es-AR",
                      {
                        minimumFractionDigits:
                          horas % 1 === 0
                            ? 0
                            : 1,
                        maximumFractionDigits: 1,
                      }
                    )}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-[#7A837D]">
                    {horas <= 1
                      ? "hora"
                      : "horas"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    increaseHours
                  }
                  disabled={
                    loading ||
                    horas >= 50
                  }
                  className="
                    flex h-12 w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EAF2ED]
                    text-[#18392B]
                    transition
                    hover:bg-[#DCE9E0]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  <Plus size={20} />
                </button>
              </div>

              <p className="mt-2 text-center text-xs text-[#828B85]">
                Cada toque suma o resta 0,5 horas
              </p>
            </div>

            {/* OBSERVACIÓN */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Observación
              </label>

              <textarea
                rows={3}
                placeholder="Detalle del trabajo realizado..."
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
                className="w-full resize-none rounded-2xl border border-[#DDE3DF] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            {/* RESUMEN */}
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
                        ? money(
                            valorHora
                          )
                        : "Sin configurar"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
                    Total
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#18392B]">
                    {money(
                      total
                    )}
                  </p>
                </div>
              </div>
            </div>
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
              sm:px-6
              sm:pb-5
            "
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F8F7] disabled:opacity-50"
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
          </div>
        </form>
      </div>
    </div>
  );
}