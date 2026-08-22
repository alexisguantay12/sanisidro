import {
  useMemo,
  useState,
} from "react";

import {
  Check,
  Layers3,
  Loader2,
  Search,
  Sprout,
} from "lucide-react";

import {
  getAlmacigosPendientes,
  liquidarAlmacigos,
} from "../../features/administracion/api";

import EmptyState
  from "../../features/administracion/components/EmptyState";

import PageHeader
  from "../../features/administracion/components/PageHeader";

import SummaryCard
  from "../../features/administracion/components/SummaryCard";

import AdministracionTabs from "../../features/administracion/components/AdministracionTabs";  

import type {
  AlmacigosPendientesResponse,
} from "../../features/administracion/types";

import {
  firstDayOfMonth,
  formatDate,
  money,
  today,
} from "../../features/administracion/utils";


export default function PagoAlmacigosPage() {
  const [
    fechaDesde,
    setFechaDesde,
  ] = useState(
    firstDayOfMonth(),
  );

  const [
    fechaHasta,
    setFechaHasta,
  ] = useState(today());

  const [
    fechaPago,
    setFechaPago,
  ] = useState(today());

  const [
    data,
    setData,
  ] =
    useState<AlmacigosPendientesResponse | null>(
      null,
    );

  const [
    selected,
    setSelected,
  ] = useState<number[]>([]);

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


  async function buscar() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getAlmacigosPendientes(
          fechaDesde,
          fechaHasta,
        );

      setData(result);

      setSelected(
        result.almacigos.map(
          (item) => item.id,
        ),
      );
    } catch {
      setError(
        "No se pudieron consultar los almácigos.",
      );
    } finally {
      setLoading(false);
    }
  }


  function toggle(id: number) {
    setSelected(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id,
            )
          : [
              ...current,
              id,
            ],
    );
  }


  const total =
    useMemo(() => {
      if (!data) {
        return 0;
      }

      return data.almacigos
        .filter((item) =>
          selected.includes(
            item.id,
          ),
        )
        .reduce(
          (acc, item) =>
            acc +
            Number(item.importe),
          0,
        );
    }, [
      data,
      selected,
    ]);


  async function pagar() {
    try {
      setLoading(true);
      setError("");

      await liquidarAlmacigos({
        fecha_desde:
          fechaDesde,

        fecha_hasta:
          fechaHasta,

        fecha_pago:
          fechaPago,

        almacigos:
          selected,

        observacion,
      });

      await buscar();

      setObservacion("");
    } catch {
      setError(
        "No se pudo registrar el pago.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <PageHeader
          title="Pago de almácigos"
          description="
            Revisá los trabajos realizados
            y agrupá los que querés pagar.
          "
          icon={Sprout}
        />
        <AdministracionTabs
          pendientesTo="/administracion/almacigos"
          historialTo="/administracion/almacigos/historial"
        />

        <section
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            sm:p-6
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) =>
                setFechaDesde(
                  e.target.value,
                )
              }
              className="
                rounded-xl
                border
                border-slate-300
                px-3
                py-3
              "
            />

            <input
              type="date"
              value={fechaHasta}
              onChange={(e) =>
                setFechaHasta(
                  e.target.value,
                )
              }
              className="
                rounded-xl
                border
                border-slate-300
                px-3
                py-3
              "
            />
          </div>

          <button
            type="button"
            onClick={buscar}
            className="
              mt-4
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-900
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              sm:w-auto
            "
          >
            <Search size={18} />

            Consultar pendientes
          </button>
        </section>

        {error && (
          <div
            className="
              mt-4
              rounded-xl
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {data && (
          <>
            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                lg:grid-cols-3
              "
            >
              <SummaryCard
                title="Registros"
                value={
                  String(
                    data.resumen
                      .cantidad_registros,
                  )
                }
                icon={Layers3}
              />

              <SummaryCard
                title="Almácigos"
                value={
                  String(
                    data.resumen
                      .cantidad_total,
                  )
                }
                icon={Sprout}
              />

              <SummaryCard
                title="Seleccionado"
                value={money(total)}
                icon={Check}
              />
            </div>

            <section
              className="
                mt-5
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-4
                shadow-sm
                sm:p-6
              "
            >
              {data.almacigos.length === 0
                ? (
                  <EmptyState
                    title="No hay almácigos pendientes"
                  />
                )
                : (
                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-3
                      md:grid-cols-2
                    "
                  >
                    {data.almacigos.map(
                      (item) => {
                        const active =
                          selected.includes(
                            item.id,
                          );

                        return (
                          <button
                            type="button"
                            key={item.id}
                            onClick={() =>
                              toggle(
                                item.id,
                              )
                            }
                            className={`
                              rounded-2xl
                              border
                              p-4
                              text-left
                              transition
                              ${
                                active
                                  ? "border-emerald-300 bg-emerald-50"
                                  : "border-slate-200"
                              }
                            `}
                          >
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-4
                              "
                            >
                              <div>
                                <p
                                  className="
                                    font-bold
                                    text-slate-900
                                  "
                                >
                                  {
                                    item.cantidad
                                  } almácigos
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                  "
                                >
                                  {formatDate(
                                    item.fecha,
                                  )}
                                </p>
                              </div>

                              <div
                                className="
                                  text-right
                                "
                              >
                                <p
                                  className="
                                    font-bold
                                    text-slate-900
                                  "
                                >
                                  {money(
                                    item.importe,
                                  )}
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-xs
                                    text-slate-500
                                  "
                                >
                                  {money(
                                    item.valor_unitario,
                                  )} c/u
                                </p>
                              </div>
                            </div>

                            {item.observacion && (
                              <p
                                className="
                                  mt-3
                                  text-sm
                                  text-slate-500
                                "
                              >
                                {
                                  item.observacion
                                }
                              </p>
                            )}
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
            </section>

            <section
              className="
                sticky
                bottom-3
                mt-5
                rounded-3xl
                border
                border-slate-200
                bg-white/95
                p-4
                shadow-xl
                backdrop-blur
              "
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-2
                "
              >
                <input
                  type="date"
                  value={fechaPago}
                  onChange={(e) =>
                    setFechaPago(
                      e.target.value,
                    )
                  }
                  className="
                    rounded-xl
                    border
                    border-slate-300
                    px-3
                    py-3
                  "
                />

                <input
                  value={observacion}
                  onChange={(e) =>
                    setObservacion(
                      e.target.value,
                    )
                  }
                  placeholder="Observación"
                  className="
                    rounded-xl
                    border
                    border-slate-300
                    px-3
                    py-3
                  "
                />
              </div>

              <div
                className="
                  mt-4
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <p
                  className="
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {money(total)}
                </p>

                <button
                  type="button"
                  onClick={pagar}
                  disabled={
                    loading
                    ||
                    selected.length === 0
                  }
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    px-6
                    py-3
                    font-semibold
                    text-white
                    disabled:opacity-50
                  "
                >
                  {loading && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  Confirmar pago
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}