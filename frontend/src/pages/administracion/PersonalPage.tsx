import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Search,
  UserRound,
} from "lucide-react";

import {
  getPeones,
  getPersonalPendiente,
  liquidarPersonal,
} from "../../features/administracion/api";

import EmptyState
  from "../../features/administracion/components/EmptyState";

import PageHeader
  from "../../features/administracion/components/PageHeader";

import SummaryCard
  from "../../features/administracion/components/SummaryCard";

import AdministracionTabs from "../../features/administracion/components/AdministracionTabs";


import type {
  PeonSimple,
  PersonalPendienteResponse,
} from "../../features/administracion/types";

import {
  firstDayOfMonth,
  formatDate,
  money,
  today,
} from "../../features/administracion/utils";


export default function PersonalPage() {
  const [
    peones,
    setPeones,
  ] = useState<PeonSimple[]>([]);

  const [
    peon,
    setPeon,
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
  ] = useState(
    today(),
  );

  const [
    fechaPago,
    setFechaPago,
  ] = useState(
    today(),
  );

  const [
    data,
    setData,
  ] =
    useState<PersonalPendienteResponse | null>(
      null,
    );

  const [
    tarjasSeleccionadas,
    setTarjasSeleccionadas,
  ] = useState<number[]>([]);

  const [
    horasSeleccionadas,
    setHorasSeleccionadas,
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
    paying,
    setPaying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function load() {
      try {
        const result =
          await getPeones();

        setPeones(result);
      } catch {
        setError(
          "No se pudieron cargar los peones.",
        );
      }
    }

    load();
  }, []);


  async function buscar() {
    if (!peon) {
      setError(
        "Seleccioná un peón.",
      );

      return;
    }

    try {
      setError("");
      setLoading(true);

      const result =
        await getPersonalPendiente(
          Number(peon),
          fechaDesde,
          fechaHasta,
        );

      setData(result);

      setTarjasSeleccionadas(
        result.tarjas.map(
          (item) => item.id,
        ),
      );

      setHorasSeleccionadas(
        result.horas_extra.map(
          (item) => item.id,
        ),
      );
    } catch {
      setData(null);

      setError(
        "No se pudo consultar la liquidación.",
      );
    } finally {
      setLoading(false);
    }
  }


  function toggleTarja(
    id: number,
  ) {
    setTarjasSeleccionadas(
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


  function toggleHora(
    id: number,
  ) {
    setHorasSeleccionadas(
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

      const tarjas =
        data.tarjas
          .filter((item) =>
            tarjasSeleccionadas.includes(
              item.id,
            ),
          )
          .reduce(
            (acc, item) =>
              acc +
              Number(item.importe),
            0,
          );

      const horas =
        data.horas_extra
          .filter((item) =>
            horasSeleccionadas.includes(
              item.id,
            ),
          )
          .reduce(
            (acc, item) =>
              acc +
              Number(item.importe),
            0,
          );

      return tarjas + horas;
    }, [
      data,
      tarjasSeleccionadas,
      horasSeleccionadas,
    ]);


  async function pagar() {
    if (!data) {
      return;
    }

    if (
      tarjasSeleccionadas.length === 0
      &&
      horasSeleccionadas.length === 0
    ) {
      setError(
        "Seleccioná al menos un registro.",
      );

      return;
    }

    try {
      setPaying(true);
      setError("");

      await liquidarPersonal({
        peon: data.peon.id,

        fecha_desde:
          fechaDesde,

        fecha_hasta:
          fechaHasta,

        fecha_pago:
          fechaPago,

        tarjas:
          tarjasSeleccionadas,

        horas_extra:
          horasSeleccionadas,

        observacion,
      });

      await buscar();

      setObservacion("");
    } catch {
      setError(
        "No se pudo realizar la liquidación.",
      );
    } finally {
      setPaying(false);
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
          max-w-7xl
        "
      >
        <PageHeader
          title="Pagos al personal"
          description="
            Revisá tarjas y horas extra
            pendientes antes de realizar
            una liquidación.
          "
          icon={Banknote}
        />
        <AdministracionTabs
        pendientesTo="/administracion/personal"
        historialTo="/administracion/personal/historial"
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
              md:grid-cols-3
            "
          >
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
                Peón
              </span>

              <select
                value={peon}
                onChange={(e) =>
                  setPeon(
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
                  text-sm
                  outline-none
                  focus:border-emerald-500
                "
              >
                <option value="">
                  Seleccionar
                </option>

                {peones.map(
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
                  text-sm
                  outline-none
                  focus:border-emerald-500
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
                  text-sm
                  outline-none
                  focus:border-emerald-500
                "
              />
            </label>
          </div>

          <button
            type="button"
            onClick={buscar}
            disabled={loading}
            className="
              mt-4
              inline-flex
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
              transition
              hover:bg-slate-800
              disabled:opacity-60
              sm:w-auto
            "
          >
            {loading
              ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              )
              : (
                <Search size={18} />
              )}

            Consultar pendientes
          </button>
        </section>

        {error && (
          <div
            className="
              mt-4
              rounded-xl
              border
              border-red-200
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
            <section
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                lg:grid-cols-4
              "
            >
              <SummaryCard
                title="Tarjas"
                value={
                  String(
                    data.resumen
                      .cantidad_tarjas,
                  )
                }
                icon={CalendarDays}
              />

              <SummaryCard
                title="Horas extra"
                value={
                  String(
                    data.resumen
                      .cantidad_horas_extra,
                  )
                }
                icon={Clock3}
              />

              <SummaryCard
                title="Peón"
                value={
                  data.peon.nombre
                }
                icon={UserRound}
              />

              <SummaryCard
                title="Seleccionado"
                value={
                  money(
                    totalSeleccionado,
                  )
                }
                icon={Banknote}
              />
            </section>

            <section
              className="
                mt-5
                grid
                grid-cols-1
                gap-5
                xl:grid-cols-2
              "
            >
              <div
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >
                <h2
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >
                  Tarjas
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Jornales incluidos
                  en el período.
                </p>

                <div
                  className="
                    mt-4
                    space-y-3
                  "
                >
                  {data.tarjas.length === 0
                    ? (
                      <EmptyState
                        title="Sin tarjas pendientes"
                      />
                    )
                    : data.tarjas.map(
                        (item) => {
                          const selected =
                            tarjasSeleccionadas
                              .includes(
                                item.id,
                              );

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                toggleTarja(
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
                                  selected
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }
                              `}
                            >
                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-3
                                "
                              >
                                <div>
                                  <p
                                    className="
                                      font-semibold
                                      text-slate-900
                                    "
                                  >
                                    {formatDate(
                                      item.fecha,
                                    )}
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      text-slate-500
                                    "
                                  >
                                    {
                                      item.fraccion_display
                                    }

                                    {item.tarea_display
                                      ? ` · ${item.tarea_display}`
                                      : ""}
                                  </p>
                                </div>

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-3
                                  "
                                >
                                  <span
                                    className="
                                      font-bold
                                      text-slate-900
                                    "
                                  >
                                    {money(
                                      item.importe,
                                    )}
                                  </span>

                                  <div
                                    className={`
                                      flex
                                      h-6
                                      w-6
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      ${
                                        selected
                                          ? "border-emerald-600 bg-emerald-600 text-white"
                                          : "border-slate-300"
                                      }
                                    `}
                                  >
                                    {selected && (
                                      <Check
                                        size={15}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        },
                      )}
                </div>
              </div>

              <div
                className="
                  rounded-3xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >
                <h2
                  className="
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >
                  Horas extra
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Horas adicionales
                  pendientes de pago.
                </p>

                <div
                  className="
                    mt-4
                    space-y-3
                  "
                >
                  {data.horas_extra.length === 0
                    ? (
                      <EmptyState
                        title="Sin horas extra pendientes"
                      />
                    )
                    : data.horas_extra.map(
                        (item) => {
                          const selected =
                            horasSeleccionadas
                              .includes(
                                item.id,
                              );

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                toggleHora(
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
                                  selected
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-slate-200 bg-white hover:bg-slate-50"
                                }
                              `}
                            >
                              <div
                                className="
                                  flex
                                  items-start
                                  justify-between
                                  gap-3
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
                                    } hs · {
                                      item.motivo_display
                                    }
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
                                    flex
                                    items-center
                                    gap-3
                                  "
                                >
                                  <span
                                    className="
                                      font-bold
                                      text-slate-900
                                    "
                                  >
                                    {money(
                                      item.importe,
                                    )}
                                  </span>

                                  <div
                                    className={`
                                      flex
                                      h-6
                                      w-6
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      ${
                                        selected
                                          ? "border-emerald-600 bg-emerald-600 text-white"
                                          : "border-slate-300"
                                      }
                                    `}
                                  >
                                    {selected && (
                                      <Check
                                        size={15}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        },
                      )}
                </div>
              </div>
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
                sm:p-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  lg:flex-row
                  lg:items-end
                  lg:justify-between
                "
              >
                <div
                  className="
                    grid
                    flex-1
                    grid-cols-1
                    gap-3
                    sm:grid-cols-2
                  "
                >
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
                      Fecha de pago
                    </span>

                    <input
                      type="date"
                      value={fechaPago}
                      onChange={(e) =>
                        setFechaPago(
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
                      Observación
                    </span>

                    <input
                      value={observacion}
                      onChange={(e) =>
                        setObservacion(
                          e.target.value,
                        )
                      }
                      placeholder="Opcional"
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

                <div
                  className="
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-center
                  "
                >
                  <div>
                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Total a pagar
                    </p>

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
                  </div>

                  <button
                    type="button"
                    onClick={pagar}
                    disabled={
                      paying
                      ||
                      totalSeleccionado <= 0
                    }
                    className="
                      inline-flex
                      min-h-12
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-emerald-600
                      px-6
                      py-3
                      font-semibold
                      text-white
                      hover:bg-emerald-700
                      disabled:opacity-50
                    "
                  >
                    {paying && (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    )}

                    Confirmar pago
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}