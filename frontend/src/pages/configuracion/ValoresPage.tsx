import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Banknote,
  Clock3,
  History,
  Pencil,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getConfiguracionTractorActual,
  getValoresJornal,
  getValorJornalActual,
} from "../../features/configuracion/api";

import ValorJornalModal
  from "../../features/configuracion/ValorJornalModal";

import TractorValorModal
  from "../../features/configuracion/TractorValorModal";

import type {
  ConfiguracionTractor,
  ValorJornal,
} from "../../features/configuracion/types";

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
  ).format(
    Number(value || 0)
  );
}

function date(
  value: string
) {
  if (!value) {
    return "-";
  }

  const [
    y,
    m,
    d,
  ] = value.split("-");

  return `${d}/${m}/${y}`;
}

export default function ValoresPage() {
  const navigate =
    useNavigate();

  const [
    jornal,
    setJornal,
  ] = useState<ValorJornal | null>(
    null
  );

  const [
    historial,
    setHistorial,
  ] = useState<ValorJornal[]>([]);

  const [
    tractor,
    setTractor,
  ] = useState<ConfiguracionTractor | null>(
    null
  );

  const [
    jornalOpen,
    setJornalOpen,
  ] = useState(false);

  const [
    tractorOpen,
    setTractorOpen,
  ] = useState(false);

  async function loadData() {
    const historialData =
      await getValoresJornal();

    setHistorial(
      historialData
    );

    try {
      setJornal(
        await getValorJornalActual()
      );
    } catch {
      setJornal(null);
    }

    try {
      setTractor(
        await getConfiguracionTractorActual()
      );
    } catch {
      setTractor(null);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <>
      <div className="min-h-full bg-[#F6F8F6]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
          <button
            onClick={() =>
              navigate(
                "/configuracion"
              )
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#667069] hover:text-[#18392B]"
          >
            <ArrowLeft size={17} />
            Configuración
          </button>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Configuración
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
              Valores
            </h1>

            <p className="mt-2 text-sm text-[#78817B]">
              Valores utilizados para
              cálculos automáticos del
              sistema.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] border border-[#E4E8E5] bg-white p-5 shadow-[0_8px_28px_rgba(27,30,28,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#18392B]">
                  <Banknote size={22} />
                </div>

                <button
                  onClick={() =>
                    setJornalOpen(true)
                  }
                  className="flex h-10 items-center gap-2 rounded-xl border border-[#DDE3DF] px-3 text-sm font-semibold text-[#59615C] hover:bg-[#F7F8F7]"
                >
                  <Pencil size={15} />
                  Actualizar
                </button>
              </div>

              <p className="mt-5 text-sm font-semibold text-[#737C76]">
                Valor Jornal
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1B1E1C]">
                {jornal
                  ? money(
                      jornal.valor
                    )
                  : "Sin configurar"}
              </p>

              {jornal && (
                <p className="mt-2 text-xs text-[#8B948E]">
                  Vigente desde{" "}
                  {date(
                    jornal.vigente_desde
                  )}
                </p>
              )}
            </div>

            <div className="rounded-[26px] border border-[#E4E8E5] bg-white p-5 shadow-[0_8px_28px_rgba(27,30,28,0.04)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#18392B]">
                  <Clock3 size={22} />
                </div>

                <button
                  onClick={() =>
                    setTractorOpen(
                      true
                    )
                  }
                  className="flex h-10 items-center gap-2 rounded-xl border border-[#DDE3DF] px-3 text-sm font-semibold text-[#59615C] hover:bg-[#F7F8F7]"
                >
                  <Pencil size={15} />
                  Editar
                </button>
              </div>

              <p className="mt-5 text-sm font-semibold text-[#737C76]">
                Hora Tractor Sergio
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1B1E1C]">
                {tractor
                  ? money(
                      tractor.valor_hora_sergio
                    )
                  : "Sin configurar"}
              </p>

              <p className="mt-2 text-xs text-[#8B948E]">
                Valor utilizado al registrar
                nuevas horas del tractor.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E4E8E5] bg-white shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
            <div className="flex items-center gap-3 border-b border-[#E8ECE9] px-5 py-4">
              <History
                size={18}
                className="text-[#60766A]"
              />

              <div>
                <p className="text-sm font-semibold text-[#333936]">
                  Historial de jornales
                </p>

                <p className="text-xs text-[#8B948E]">
                  Valores registrados
                  anteriormente.
                </p>
              </div>
            </div>

            {historial.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[#8B948E]">
                No hay valores registrados.
              </div>
            ) : (
              <div className="divide-y divide-[#EEF1EF]">
                {historial.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-5 py-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#333936]">
                          {money(
                            item.valor
                          )}
                        </p>

                        <p className="mt-1 text-xs text-[#8B948E]">
                          Desde{" "}
                          {date(
                            item.vigente_desde
                          )}
                        </p>
                      </div>

                      {item.activo && (
                        <span className="rounded-full bg-[#EEF3EF] px-3 py-1 text-xs font-semibold text-[#466052]">
                          Vigente
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ValorJornalModal
        open={jornalOpen}
        onClose={() =>
          setJornalOpen(false)
        }
        onSuccess={loadData}
      />

      <TractorValorModal
        open={tractorOpen}
        valorActual={
          tractor
            ?.valor_hora_sergio ??
          ""
        }
        onClose={() =>
          setTractorOpen(false)
        }
        onSuccess={loadData}
      />
    </>
  );
}