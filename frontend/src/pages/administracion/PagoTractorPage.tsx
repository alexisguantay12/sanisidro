import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Clock3,
  Loader2,
  Search,
  Tractor,
} from "lucide-react";

import {
  getProveedores,
  getTractorPendiente,
  liquidarTractor,
} from "../../features/administracion/api";

import EmptyState
  from "../../features/administracion/components/EmptyState";

import PageHeader
  from "../../features/administracion/components/PageHeader";

import SummaryCard
  from "../../features/administracion/components/SummaryCard";

import AdministracionTabs from "../../features/administracion/components/AdministracionTabs"; 
  

import type {
  ProveedorSimple,
  TipoTractor,
  TractorPendienteResponse,
} from "../../features/administracion/types";

import {
  firstDayOfMonth,
  formatDate,
  money,
  today,
} from "../../features/administracion/utils";


export default function PagoTractorPage() {
  const [
    tipo,
    setTipo,
  ] =
    useState<TipoTractor>(
      "SERGIO",
    );

  const [
    proveedores,
    setProveedores,
  ] =
    useState<ProveedorSimple[]>(
      [],
    );

  const [
    proveedor,
    setProveedor,
  ] = useState("");

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
    useState<TractorPendienteResponse | null>(
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


  useEffect(() => {
    getProveedores()
      .then(setProveedores)
      .catch(() => {});
  }, []);


  async function buscar() {
    if (
      tipo === "TERCERO"
      &&
      !proveedor
    ) {
      setError(
        "Seleccioná un proveedor.",
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await getTractorPendiente(
          tipo,
          fechaDesde,
          fechaHasta,
          proveedor
            ? Number(proveedor)
            : undefined,
        );

      setData(result);

      setSelected(
        result.trabajos.map(
          (item) => item.id,
        ),
      );
    } catch {
      setData(null);

      setError(
        "No se pudieron consultar los trabajos.",
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


  const totalSeleccionado =
    useMemo(() => {
      if (!data) {
        return 0;
      }

      return data.trabajos
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


  async function liquidar() {
    if (!data) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await liquidarTractor({
        tipo,

        ...(tipo === "TERCERO"
          ? {
              proveedor:
                Number(proveedor),
            }
          : {}),

        fecha_desde:
          fechaDesde,

        fecha_hasta:
          fechaHasta,

        fecha_pago:
          fechaPago,

        trabajos:
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
          title="Pago de tractor"
          description="
            Liquidá trabajos realizados
            por Sergio o por proveedores
            externos.
          "
          icon={Tractor}
        />
        <AdministracionTabs
          pendientesTo="/administracion/tractor"
          historialTo="/administracion/tractor/historial"
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
              grid-cols-2
              gap-2
              rounded-2xl
              bg-slate-100
              p-1
            "
          >
            {[
              {
                value: "SERGIO",
                label: "Sergio",
              },
              {
                value: "TERCERO",
                label: "Terceros",
              },
            ].map(
              (item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setTipo(
                      item.value as TipoTractor,
                    );

                    setData(null);
                  }}
                  className={`
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    transition
                    ${
                      tipo === item.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500"
                    }
                  `}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>

          <div
            className="
              mt-4
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            "
          >
            {tipo === "TERCERO" && (
              <label>
                <span
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-slate-700
                  "
                >
                  Proveedor
                </span>

                <select
                  value={proveedor}
                  onChange={(e) =>
                    setProveedor(
                      e.target.value,
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-3
                  "
                >
                  <option value="">
                    Seleccionar
                  </option>

                  {proveedores.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.nombre}
                      </option>
                    ),
                  )}
                </select>
              </label>
            )}

            <label>
              <span
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Desde
              </span>

              <input
                type="date"
                value={fechaDesde}
                onChange={(e) =>
                  setFechaDesde(
                    e.target.value,
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-3
                  py-3
                "
              />
            </label>

            <label>
              <span
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Hasta
              </span>

              <input
                type="date"
                value={fechaHasta}
                onChange={(e) =>
                  setFechaHasta(
                    e.target.value,
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  px-3
                  py-3
                "
              />
            </label>
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

            Consultar trabajos
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
                title="Trabajos"
                value={
                  String(
                    data.resumen
                      .cantidad_trabajos,
                  )
                }
                icon={Tractor}
              />

              <SummaryCard
                title="Horas"
                value={
                  data.resumen
                    .total_horas
                }
                icon={Clock3}
              />

              <SummaryCard
                title="Seleccionado"
                value={
                  money(
                    totalSeleccionado,
                  )
                }
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
              {data.trabajos.length === 0
                ? (
                  <EmptyState
                    title="No hay trabajos pendientes"
                  />
                )
                : (
                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-3
                      lg:grid-cols-2
                    "
                  >
                    {data.trabajos.map(
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
                              rounded-2xl
                              border
                              p-4
                              text-left
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
                                    font-semibold
                                    text-slate-900
                                  "
                                >
                                  {
                                    item.cantidad_horas
                                  } horas
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

                                {item.observacion && (
                                  <p
                                    className="
                                      mt-2
                                      text-sm
                                      text-slate-500
                                    "
                                  >
                                    {
                                      item.observacion
                                    }
                                  </p>
                                )}
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
                                    item.valor_hora,
                                  )} / h
                                </p>
                              </div>
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
                  md:grid-cols-2
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
                  placeholder="Observación opcional"
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
                  {money(
                    totalSeleccionado,
                  )}
                </p>

                <button
                  type="button"
                  onClick={liquidar}
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