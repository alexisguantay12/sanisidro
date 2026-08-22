import {
  useMemo,
  useState,
} from "react";

import {
  Check,
  HandCoins,
  Loader2,
  ReceiptText,
  Search,
  ShoppingBag,
} from "lucide-react";

import {
  crearRendicion,
  getRendicionesPendientes,
} from "../../features/administracion/api";

import EmptyState
  from "../../features/administracion/components/EmptyState";

import PageHeader
  from "../../features/administracion/components/PageHeader";

import SummaryCard
  from "../../features/administracion/components/SummaryCard";

import AdministracionTabs from "../../features/administracion/components/AdministracionTabs";  

import type {
  RendicionesPendientesResponse,
} from "../../features/administracion/types";

import {
  firstDayOfMonth,
  formatDate,
  money,
  today,
} from "../../features/administracion/utils";


export default function RendicionesPage() {
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
    fechaRendicion,
    setFechaRendicion,
  ] = useState(today());

  const [
    data,
    setData,
  ] =
    useState<RendicionesPendientesResponse | null>(
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
        await getRendicionesPendientes(
          fechaDesde,
          fechaHasta,
        );

      setData(result);

      setSelected(
        result.pagos.map(
          (item) => item.id,
        ),
      );
    } catch {
      setError(
        "No se pudieron consultar los cobros pendientes.",
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

      return data.pagos
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


  async function rendir() {
    try {
      setLoading(true);
      setError("");

      await crearRendicion({
        fecha:
          fechaRendicion,

        pagos:
          selected,

        observacion,
      });

      await buscar();

      setObservacion("");
    } catch {
      setError(
        "No se pudo registrar la rendición.",
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
          title="Rendición de ventas"
          description="
            Controlá los pagos cobrados
            que todavía están pendientes
            de ingresar a administración.
          "
          icon={HandCoins}
        />
        <AdministracionTabs
            pendientesTo="/administracion/rendiciones"
            historialTo="/administracion/rendiciones/historial"
        />

        <div
          className="
            mb-5
            rounded-3xl
            border
            border-amber-200
            bg-amber-50
            p-5
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <HandCoins
              className="
                mt-0.5
                shrink-0
                text-amber-700
              "
              size={22}
            />

            <div>
              <p
                className="
                  font-bold
                  text-amber-900
                "
              >
                Dinero pendiente de rendición
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-amber-800
                "
              >
                Estos registros son pagos
                que compradores ya realizaron,
                pero que todavía no fueron
                incluidos en una rendición.
              </p>
            </div>
          </div>
        </div>

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

            Consultar cobros
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
                title="Cobros"
                value={
                  String(
                    data.resumen
                      .cantidad_pagos,
                  )
                }
                icon={ReceiptText}
              />

              <SummaryCard
                title="Pendiente total"
                value={
                  money(
                    data.resumen
                      .total_pendiente_rendir,
                  )
                }
                icon={HandCoins}
              />

              <SummaryCard
                title="A rendir ahora"
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
              {data.pagos.length === 0
                ? (
                  <EmptyState
                    title="Todo está rendido"
                    description="
                      No hay cobros pendientes
                      de rendición para este período.
                    "
                  />
                )
                : (
                  <div
                    className="
                      space-y-3
                    "
                  >
                    {data.pagos.map(
                      (item) => {
                        const active =
                          selected.includes(
                            item.id,
                          );

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              toggle(
                                item.id,
                              )
                            }
                            className={`
                              w-full
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
                              <div
                                className="
                                  flex
                                  gap-3
                                "
                              >
                                <div
                                  className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-600
                                  "
                                >
                                  <ShoppingBag
                                    size={19}
                                  />
                                </div>

                                <div>
                                  <p
                                    className="
                                      font-bold
                                      text-slate-900
                                    "
                                  >
                                    {
                                      item.comprador
                                        .nombre
                                    }
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      text-slate-500
                                    "
                                  >
                                    Venta #{
                                      item.venta
                                    }
                                    {" · "}
                                    {
                                      item.cantidad_bolsas
                                    } bolsas
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-xs
                                      text-slate-400
                                    "
                                  >
                                    {formatDate(
                                      item.fecha,
                                    )}
                                  </p>
                                </div>
                              </div>

                              <p
                                className="
                                  text-lg
                                  font-bold
                                  text-slate-900
                                "
                              >
                                {money(
                                  item.importe,
                                )}
                              </p>
                            </div>
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
                z-20
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
                  value={
                    fechaRendicion
                  }
                  onChange={(e) =>
                    setFechaRendicion(
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
                <div>
                  <p
                    className="
                      text-xs
                      text-slate-500
                    "
                  >
                    Total a ingresar
                  </p>

                  <p
                    className="
                      text-2xl
                      font-bold
                      text-slate-900
                    "
                  >
                    {money(total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={rendir}
                  disabled={
                    loading
                    ||
                    selected.length === 0
                  }
                  className="
                    inline-flex
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

                  Registrar rendición
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}