import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BadgeDollarSign,
  Banknote,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  MinusCircle,
  Search,
  UserRound,
} from "lucide-react";

import {
  getCuentasFinancieras,
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

import AdministracionTabs
  from "../../features/administracion/components/AdministracionTabs";

import type {
  CuentaFinancieraSimple,
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
    cuentas,
    setCuentas,
  ] = useState<CuentaFinancieraSimple[]>([]);

  const [
    peon,
    setPeon,
  ] = useState("");

  const [
    cuentaFinanciera,
    setCuentaFinanciera,
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
  ] = useState<
    PersonalPendienteResponse | null
  >(null);

  const [
    tarjasSeleccionadas,
    setTarjasSeleccionadas,
  ] = useState<number[]>([]);

  const [
    horasSeleccionadas,
    setHorasSeleccionadas,
  ] = useState<number[]>([]);

  /*
   * Una administración no tiene un ID propio porque
   * todavía no existe en base de datos.
   *
   * La identificamos mediante:
   *
   * valor_administrador + año + mes
   */
  const [
    administracionesSeleccionadas,
    setAdministracionesSeleccionadas,
  ] = useState<string[]>([]);

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingCuentas,
    setLoadingCuentas,
  ] = useState(false);

  const [
    paying,
    setPaying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  /* ============================================================
     CLAVE ADMINISTRACION
  ============================================================ */

  function administracionKey(
    valorAdministrador: number,
    anio: number,
    mes: number,
  ) {
    return (
      `${valorAdministrador}-${anio}-${mes}`
    );
  }


  /* ============================================================
     CARGAR PEONES
  ============================================================ */

  useEffect(() => {

    async function load() {

      try {

        const result =
          await getPeones();

        setPeones(
          result,
        );

      } catch {

        setError(
          "No se pudieron cargar los peones.",
        );

      }
    }

    load();

  }, []);


  /* ============================================================
     CARGAR CUENTAS
  ============================================================ */

  useEffect(() => {

    async function loadCuentas() {

      try {

        setLoadingCuentas(
          true,
        );

        const result =
          await getCuentasFinancieras();

        setCuentas(
          result,
        );

        if (
          result.length === 1
        ) {

          setCuentaFinanciera(
            String(
              result[0].id,
            ),
          );

        }

      } catch {

        setError(
          "No se pudieron cargar las cuentas financieras.",
        );

      } finally {

        setLoadingCuentas(
          false,
        );

      }
    }

    loadCuentas();

  }, []);


  /* ============================================================
     BUSCAR PENDIENTES
  ============================================================ */

  async function buscar() {

    if (!peon) {

      setError(
        "Seleccioná un peón.",
      );

      return;
    }

    try {

      setError("");

      setLoading(
        true,
      );

      const result =
        await getPersonalPendiente(
          Number(peon),
          fechaDesde,
          fechaHasta,
        );

      setData(
        result,
      );

      /*
       * Tarjas seleccionadas por defecto
       */
      setTarjasSeleccionadas(
        result.tarjas.map(
          (item) =>
            item.id,
        ),
      );

      /*
       * Horas seleccionadas por defecto
       */
      setHorasSeleccionadas(
        result.horas_extra.map(
          (item) =>
            item.id,
        ),
      );

      /*
       * Administración seleccionada por defecto.
       *
       * Después el usuario puede desmarcar el mes
       * si no quiere pagarlo todavía.
       */
      setAdministracionesSeleccionadas(
        (
          result.administraciones
          ?? []
        ).map(
          (item) =>
            administracionKey(
              item.valor_administrador,
              item.anio,
              item.mes,
            ),
        ),
      );

    } catch (err: any) {

      console.error(
        "Error consultando pendientes:",
        err?.response?.data
        ?? err,
      );

      setData(
        null,
      );

      setTarjasSeleccionadas(
        [],
      );

      setHorasSeleccionadas(
        [],
      );

      setAdministracionesSeleccionadas(
        [],
      );

      setError(
        "No se pudo consultar la liquidación.",
      );

    } finally {

      setLoading(
        false,
      );

    }
  }


  /* ============================================================
     SELECCION TARJAS
  ============================================================ */

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


  /* ============================================================
     SELECCION HORAS
  ============================================================ */

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


  /* ============================================================
     SELECCION ADMINISTRACION
  ============================================================ */

  function toggleAdministracion(
    valorAdministrador: number,
    anio: number,
    mes: number,
  ) {

    const key =
      administracionKey(
        valorAdministrador,
        anio,
        mes,
      );

    setAdministracionesSeleccionadas(
      (current) =>
        current.includes(key)
          ? current.filter(
              (item) =>
                item !== key,
            )
          : [
              ...current,
              key,
            ],
    );

  }


  /* ============================================================
     TOTAL SELECCIONADO
  ============================================================ */

  const totalSeleccionado =
    useMemo(() => {

      if (!data) {
        return 0;
      }


      /* ---------------------------
         TARJAS
      --------------------------- */

      const tarjas =
        data.tarjas
          .filter(
            (item) =>
              tarjasSeleccionadas
                .includes(
                  item.id,
                ),
          )
          .reduce(
            (acc, item) =>
              acc
              +
              Number(
                item.importe,
              ),
            0,
          );


      /* ---------------------------
         HORAS EXTRA
      --------------------------- */

      const horas =
        data.horas_extra
          .filter(
            (item) =>
              horasSeleccionadas
                .includes(
                  item.id,
                ),
          )
          .reduce(
            (acc, item) =>
              acc
              +
              Number(
                item.importe,
              ),
            0,
          );


      /* ---------------------------
         ADMINISTRACION
      --------------------------- */

      const administraciones =
        (
          data.administraciones
          ?? []
        )
          .filter(
            (item) =>
              administracionesSeleccionadas
                .includes(
                  administracionKey(
                    item.valor_administrador,
                    item.anio,
                    item.mes,
                  ),
                ),
          )
          .reduce(
            (acc, item) =>
              acc
              +
              Number(
                item.importe,
              ),
            0,
          );


      /* ---------------------------
         DESCUENTOS
      --------------------------- */

      const descuentos =
        (
          data.tarjas_externas
          ?? []
        ).reduce(
          (acc, item) =>
            acc
            +
            Number(
              item.importe,
            ),
          0,
        );


      return (
        tarjas
        +
        horas
        +
        administraciones
        -
        descuentos
      );

    }, [
      data,
      tarjasSeleccionadas,
      horasSeleccionadas,
      administracionesSeleccionadas,
    ]);


  /* ============================================================
     PAGAR
  ============================================================ */

  async function pagar() {

    if (!data) {
      return;
    }


    /* ----------------------------------------------------------
       DEBE HABER AL MENOS UN CONCEPTO SELECCIONADO
    ---------------------------------------------------------- */

    if (
      tarjasSeleccionadas.length === 0
      &&
      horasSeleccionadas.length === 0
      &&
      administracionesSeleccionadas.length === 0
    ) {

      setError(
        "Seleccioná al menos una tarja, una hora extra o una administración.",
      );

      return;
    }


    if (!cuentaFinanciera) {

      setError(
        "Seleccioná la cuenta desde donde se realiza el pago.",
      );

      return;
    }


    if (
      totalSeleccionado <= 0
    ) {

      setError(
        "El total a pagar debe ser mayor a cero.",
      );

      return;
    }


    /*
     * Convertimos los meses seleccionados
     * al formato que espera Django.
     */
    const administraciones =
      (
        data.administraciones
        ?? []
      )
        .filter(
          (item) =>
            administracionesSeleccionadas
              .includes(
                administracionKey(
                  item.valor_administrador,
                  item.anio,
                  item.mes,
                ),
              ),
        )
        .map(
          (item) => ({
            valor_administrador:
              item.valor_administrador,

            anio:
              item.anio,

            mes:
              item.mes,
          }),
        );


    try {

      setPaying(
        true,
      );

      setError("");


      await liquidarPersonal({

        peon:
          data.peon.id,

        fecha_desde:
          fechaDesde,

        fecha_hasta:
          fechaHasta,

        fecha_pago:
          fechaPago,

        cuenta_financiera:
          Number(
            cuentaFinanciera,
          ),

        tarjas:
          tarjasSeleccionadas,

        horas_extra:
          horasSeleccionadas,

        administraciones,

        observacion,

      });


      /*
       * Volvemos a consultar.
       *
       * Lo ya liquidado debería desaparecer
       * automáticamente de pendientes.
       */
      await buscar();

      setObservacion(
        "",
      );

    } catch (err: any) {

      console.error(
        "Error liquidando personal:",
        err?.response?.data
        ?? err,
      );

      const backend =
        err?.response?.data;

      if (
        backend?.administraciones
      ) {

        setError(
          Array.isArray(
            backend.administraciones,
          )
            ? backend
                .administraciones
                .join(" ")
            : String(
                backend.administraciones,
              ),
        );

      } else if (
        backend?.detail
      ) {

        setError(
          String(
            backend.detail,
          ),
        );

      } else if (
        backend
      ) {

        setError(
          JSON.stringify(
            backend,
          ),
        );

      } else {

        setError(
          "No se pudo realizar la liquidación.",
        );

      }

    } finally {

      setPaying(
        false,
      );

    }
  }


  /* ============================================================
     RENDER
  ============================================================ */

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
            Revisá tarjas, horas extra,
            administración y jornales
            a descontar antes de realizar
            una liquidación.
          "
          icon={Banknote}
        />


        <AdministracionTabs
          pendientesTo="/administracion/personal"
          historialTo="/administracion/personal/historial"
        />


        {/* ====================================================
            FILTROS
        ==================================================== */}

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
                <Search
                  size={18}
                />
              )}

            Consultar pendientes

          </button>

        </section>


        {/* ====================================================
            ERROR
        ==================================================== */}

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

            {/* =================================================
                RESUMEN
            ================================================= */}

            <section
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                md:grid-cols-3
                xl:grid-cols-6
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
                title="Administración"
                value={
                  String(
                    data.resumen
                      .cantidad_administraciones
                    ?? 0,
                  )
                }
                icon={BadgeDollarSign}
              />


              <SummaryCard
                title="Descuentos"
                value={
                  `-${money(
                    data.resumen
                      .total_descuentos,
                  )}`
                }
                icon={MinusCircle}
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


            {/* =================================================
                TARJAS + HORAS EXTRA
            ================================================= */}

            <section
              className="
                mt-5
                grid
                grid-cols-1
                gap-5
                xl:grid-cols-2
              "
            >

              {/* =================================================
                  TARJAS
              ================================================= */}

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
                                      item
                                        .fraccion_display
                                    }

                                    {
                                      item
                                        .tarea_display
                                        ? (
                                          ` · ${item.tarea_display}`
                                        )
                                        : ""
                                    }
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


              {/* =================================================
                  HORAS EXTRA
              ================================================= */}

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

                  {
                    data
                      .horas_extra
                      .length === 0
                      ? (

                        <EmptyState
                          title="Sin horas extra pendientes"
                        />

                      )
                      : data
                          .horas_extra
                          .map(
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
                                          item
                                            .cantidad_horas
                                        } hs · {
                                          item
                                            .motivo_display
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
                          )
                  }

                </div>

              </div>

            </section>


            {/* =================================================
                ADMINISTRACION
            ================================================= */}

            {(
              data.administraciones
              ?? []
            ).length > 0 && (

              <section
                className="
                  mt-5
                  rounded-3xl
                  border
                  border-emerald-200
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >

                <div
                  className="
                    flex
                    items-start
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
                      bg-emerald-100
                      text-emerald-700
                    "
                  >
                    <BadgeDollarSign
                      size={20}
                    />
                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                      "
                    >
                      Administración
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Jornales mensuales
                      correspondientes al rol
                      de administrador.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    mt-4
                    grid
                    grid-cols-1
                    gap-3
                    lg:grid-cols-2
                  "
                >

                  {data.administraciones.map(
                    (item) => {

                      const key =
                        administracionKey(
                          item.valor_administrador,
                          item.anio,
                          item.mes,
                        );

                      const selected =
                        administracionesSeleccionadas
                          .includes(
                            key,
                          );

                      return (

                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            toggleAdministracion(
                              item.valor_administrador,
                              item.anio,
                              item.mes,
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
                              gap-4
                            "
                          >

                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >

                              <p
                                className="
                                  font-semibold
                                  text-slate-900
                                "
                              >
                                {
                                  item
                                    .descripcion
                                }
                              </p>


                              <p
                                className="
                                  mt-1
                                  text-sm
                                  text-slate-600
                                "
                              >
                                {Number(
                                  item
                                    .cantidad_jornales,
                                )} jornales
                              </p>


                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-slate-500
                                "
                              >
                                Valor jornal:{" "}
                                {money(
                                  item
                                    .valor_jornal,
                                )}
                              </p>

                            </div>


                            <div
                              className="
                                flex
                                shrink-0
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


                <div
                  className="
                    mt-4
                    flex
                    justify-end
                    border-t
                    border-emerald-100
                    pt-4
                  "
                >

                  <div
                    className="
                      text-right
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-500
                      "
                    >
                      Total administración pendiente
                    </p>


                    <p
                      className="
                        mt-1
                        text-xl
                        font-bold
                        text-emerald-700
                      "
                    >
                      {money(
                        data.resumen
                          .total_administracion
                        ?? 0,
                      )}
                    </p>

                  </div>

                </div>

              </section>

            )}


            {/* =================================================
                TARJAS EXTERNAS / DESCUENTOS
            ================================================= */}

            {(
              data.tarjas_externas
              ?? []
            ).length > 0 && (

              <section
                className="
                  mt-5
                  rounded-3xl
                  border
                  border-red-200
                  bg-white
                  p-4
                  shadow-sm
                  sm:p-5
                "
              >

                <div
                  className="
                    flex
                    items-start
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
                      bg-red-100
                      text-red-700
                    "
                  >
                    <MinusCircle
                      size={20}
                    />
                  </div>


                  <div>

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                      "
                    >
                      Jornales a descontar
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Jornales trabajados por
                      otros peones para{" "}
                      {data.peon.nombre}.
                      Se descuentan
                      automáticamente.
                    </p>

                  </div>

                </div>


                <div
                  className="
                    mt-4
                    grid
                    grid-cols-1
                    gap-3
                    lg:grid-cols-2
                  "
                >

                  {data.tarjas_externas.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="
                          rounded-2xl
                          border
                          border-red-200
                          bg-red-50
                          p-4
                        "
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
                              {item.peon_nombre}
                            </p>


                            <p
                              className="
                                mt-1
                                text-sm
                                font-medium
                                text-red-700
                              "
                            >
                              Trabajó para{" "}
                              {data.peon.nombre}
                            </p>


                            <p
                              className="
                                mt-2
                                text-sm
                                text-slate-600
                              "
                            >
                              {
                                item
                                  .fraccion_display
                              }

                              {" · "}

                              {formatDate(
                                item.fecha,
                              )}
                            </p>


                            {item.observacion && (

                              <p
                                className="
                                  mt-2
                                  text-xs
                                  text-slate-500
                                "
                              >
                                {item.observacion}
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
                                text-xs
                                font-medium
                                uppercase
                                tracking-wide
                                text-red-600
                              "
                            >
                              Descuento
                            </p>


                            <p
                              className="
                                mt-1
                                text-lg
                                font-bold
                                text-red-700
                              "
                            >
                              -
                              {money(
                                item.importe,
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                    ),
                  )}

                </div>


                <div
                  className="
                    mt-4
                    flex
                    justify-end
                    border-t
                    border-red-100
                    pt-4
                  "
                >

                  <div
                    className="
                      text-right
                    "
                  >

                    <p
                      className="
                        text-xs
                        font-medium
                        text-slate-500
                      "
                    >
                      Total a descontar
                    </p>


                    <p
                      className="
                        mt-1
                        text-xl
                        font-bold
                        text-red-700
                      "
                    >
                      -
                      {money(
                        data.resumen
                          .total_descuentos,
                      )}
                    </p>

                  </div>

                </div>

              </section>

            )}


            {/* =================================================
                CONFIRMACION DE PAGO
            ================================================= */}

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
                  xl:flex-row
                  xl:items-end
                  xl:justify-between
                "
              >

                <div
                  className="
                    grid
                    flex-1
                    grid-cols-1
                    gap-3
                    sm:grid-cols-2
                    lg:grid-cols-3
                  "
                >

                  {/* FECHA */}

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
                        bg-white
                        px-3
                        py-3
                        outline-none
                        focus:border-emerald-500
                      "
                    />

                  </label>


                  {/* CUENTA */}

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
                      Cuenta de pago
                    </span>


                    <select
                      value={
                        cuentaFinanciera
                      }
                      onChange={(e) =>
                        setCuentaFinanciera(
                          e.target.value,
                        )
                      }
                      disabled={
                        loadingCuentas
                        ||
                        paying
                      }
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-3
                        py-3
                        outline-none
                        focus:border-emerald-500
                        disabled:bg-slate-100
                        disabled:text-slate-500
                      "
                    >

                      <option value="">
                        {
                          loadingCuentas
                            ? "Cargando cuentas..."
                            : "Seleccionar cuenta"
                        }
                      </option>


                      {cuentas.map(
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


                  {/* OBSERVACION */}

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
                      value={
                        observacion
                      }
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
                        outline-none
                        focus:border-emerald-500
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

                    {/* ADMINISTRACION SELECCIONADA */}

                    {(
                      data.administraciones
                      ?? []
                    ).length > 0 && (

                      <p
                        className="
                          mb-1
                          text-xs
                          font-medium
                          text-emerald-700
                        "
                      >
                        Administración seleccionada:{" "}
                        {
                          administracionesSeleccionadas
                            .length
                        }
                      </p>

                    )}


                    {/* DESCUENTOS */}

                    {Number(
                      data.resumen
                        .total_descuentos,
                    ) > 0 && (

                      <p
                        className="
                          mb-1
                          text-xs
                          font-medium
                          text-red-600
                        "
                      >
                        Descuentos: -
                        {money(
                          data.resumen
                            .total_descuentos,
                        )}
                      </p>

                    )}


                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Total a pagar
                    </p>


                    <p
                      className={`
                        text-2xl
                        font-bold
                        ${
                          totalSeleccionado <= 0
                            ? "text-red-700"
                            : "text-slate-900"
                        }
                      `}
                    >
                      {money(
                        totalSeleccionado,
                      )}
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={
                      pagar
                    }
                    disabled={
                      paying
                      ||
                      loadingCuentas
                      ||
                      !cuentaFinanciera
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
                      transition
                      hover:bg-emerald-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >

                    {paying && (

                      <Loader2
                        size={18}
                        className="
                          animate-spin
                        "
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