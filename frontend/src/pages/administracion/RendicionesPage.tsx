import {
  useEffect,
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
  WalletCards,
} from "lucide-react";

import {
  crearRendicion,
  getCuentasFinancieras,
  getRendicionesPendientes,
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
  ] = useState(
    today(),
  );

  const [
    fechaRendicion,
    setFechaRendicion,
  ] = useState(
    today(),
  );

  const [
    cuentas,
    setCuentas,
  ] = useState<
    CuentaFinancieraSimple[]
  >([]);

  const [
    cuentaFinanciera,
    setCuentaFinanciera,
  ] = useState("");

  const [
    data,
    setData,
  ] =
    useState<
      RendicionesPendientesResponse | null
    >(
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
    loadingCuentas,
    setLoadingCuentas,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ============================================================
  // CARGAR CUENTAS FINANCIERAS
  // ============================================================

  useEffect(() => {

    async function cargarCuentas() {

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

    cargarCuentas();

  }, []);


  // ============================================================
  // BUSCAR PENDIENTES
  // ============================================================

  async function buscar() {

    try {

      setLoading(
        true,
      );

      setError(
        "",
      );

      const result =
        await getRendicionesPendientes(
          fechaDesde,
          fechaHasta,
        );

      setData(
        result,
      );

      setSelected(
        result.pagos.map(
          (item) =>
            item.id,
        ),
      );

    } catch {

      setData(
        null,
      );

      setError(
        "No se pudieron consultar los cobros pendientes.",
      );

    } finally {

      setLoading(
        false,
      );

    }

  }


  // ============================================================
  // SELECCION
  // ============================================================

  function toggle(
    id: number,
  ) {

    setSelected(
      (current) =>
        current.includes(
          id,
        )
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


  // ============================================================
  // TOTAL
  // ============================================================

  const total =
    useMemo(
      () => {

        if (!data) {
          return 0;
        }

        return data.pagos
          .filter(
            (item) =>
              selected.includes(
                item.id,
              ),
          )
          .reduce(
            (
              acc,
              item,
            ) =>
              acc
              +
              Number(
                item.importe,
              ),
            0,
          );

      },
      [
        data,
        selected,
      ],
    );


  // ============================================================
  // RENDIR
  // ============================================================

  async function rendir() {

    if (
      selected.length === 0
    ) {

      setError(
        "Seleccioná al menos un cobro.",
      );

      return;

    }

    if (
      !cuentaFinanciera
    ) {

      setError(
        "Seleccioná la cuenta donde ingresa el dinero.",
      );

      return;

    }

    try {

      setLoading(
        true,
      );

      setError(
        "",
      );

      await crearRendicion({

        fecha:
          fechaRendicion,

        cuenta_financiera:
          Number(
            cuentaFinanciera,
          ),

        pagos:
          selected,

        observacion,

      });

      await buscar();

      setObservacion(
        "",
      );

    } catch {

      setError(
        "No se pudo registrar la rendición.",
      );

    } finally {

      setLoading(
        false,
      );

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


        {/* ====================================================
            AVISO
        ==================================================== */}

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
                Desde
              </span>

              <input
                type="date"
                value={
                  fechaDesde
                }
                onChange={
                  (e) =>
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
                value={
                  fechaHasta
                }
                onChange={
                  (e) =>
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
                  outline-none
                  focus:border-emerald-500
                "
              />

            </label>

          </div>


          <button
            type="button"
            onClick={
              buscar
            }
            disabled={
              loading
            }
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
              transition
              hover:bg-slate-800
              disabled:opacity-50
              sm:w-auto
            "
          >

            {loading
              ? (
                <Loader2
                  size={18}
                  className="
                    animate-spin
                  "
                />
              )
              : (
                <Search
                  size={18}
                />
              )}

            Consultar cobros

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
                    data
                      .resumen
                      .cantidad_pagos,
                  )
                }
                icon={
                  ReceiptText
                }
              />


              <SummaryCard
                title="Pendiente total"
                value={
                  money(
                    data
                      .resumen
                      .total_pendiente_rendir,
                  )
                }
                icon={
                  HandCoins
                }
              />


              <SummaryCard
                title="A rendir ahora"
                value={
                  money(
                    total,
                  )
                }
                icon={
                  Check
                }
              />

            </div>


            {/* =================================================
                COBROS
            ================================================= */}

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
                            key={
                              item.id
                            }
                            type="button"
                            onClick={
                              () =>
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
                                    size={
                                      19
                                    }
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
                                      item
                                        .comprador
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


                              <div
                                className="
                                  flex
                                  items-start
                                  gap-3
                                "
                              >

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


                                <div
                                  className={`
                                    flex
                                    h-6
                                    w-6
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    ${
                                      active
                                        ? "border-emerald-600 bg-emerald-600 text-white"
                                        : "border-slate-300"
                                    }
                                  `}
                                >
                                  {active && (
                                    <Check
                                      size={
                                        15
                                      }
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

                )}

            </section>


            {/* =================================================
                RENDICION
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
                  grid
                  grid-cols-1
                  gap-3
                  md:grid-cols-3
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
                    Fecha de rendición
                  </span>

                  <input
                    type="date"
                    value={
                      fechaRendicion
                    }
                    onChange={
                      (e) =>
                        setFechaRendicion(
                          e.target.value,
                        )
                    }
                    disabled={
                      loading
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
                    "
                  />

                </label>


                {/* CUENTA DE INGRESO */}

                <label>

                  <span
                    className="
                      mb-2
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      text-slate-700
                    "
                  >

                    <WalletCards
                      size={
                        16
                      }
                    />

                    Cuenta de ingreso

                  </span>

                  <select
                    value={
                      cuentaFinanciera
                    }
                    onChange={
                      (e) =>
                        setCuentaFinanciera(
                          e.target.value,
                        )
                    }
                    disabled={
                      loading
                      ||
                      loadingCuentas
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

                    <option
                      value=""
                    >
                      {loadingCuentas
                        ? "Cargando cuentas..."
                        : "Seleccionar cuenta"}
                    </option>


                    {cuentas.map(
                      (item) => (

                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.nombre
                          }
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
                    onChange={
                      (e) =>
                        setObservacion(
                          e.target.value,
                        )
                    }
                    disabled={
                      loading
                    }
                    placeholder="Observación opcional"
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
                    "
                  />

                </label>

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
                      font-medium
                      text-slate-500
                    "
                  >
                    Total a ingresar
                  </p>

                  <p
                    className="
                      mt-1
                      text-2xl
                      font-bold
                      text-slate-900
                    "
                  >
                    {money(
                      total,
                    )}
                  </p>

                </div>


                <button
                  type="button"
                  onClick={
                    rendir
                  }
                  disabled={
                    loading
                    ||
                    loadingCuentas
                    ||
                    selected.length === 0
                    ||
                    !cuentaFinanciera
                    ||
                    total <= 0
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

                  {loading && (

                    <Loader2
                      size={
                        18
                      }
                      className="
                        animate-spin
                      "
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