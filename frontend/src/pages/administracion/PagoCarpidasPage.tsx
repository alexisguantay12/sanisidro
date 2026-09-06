import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Layers3,
  Loader2,
  Search,
  Sprout,
  WalletCards,
} from "lucide-react";

import {
  getCarpidasPendientes,
  getCuentasFinancieras,
  liquidarCarpidas,
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
  CarpidasPendientesResponse,
  CuentaFinancieraSimple,
} from "../../features/administracion/types";

import {
  firstDayOfMonth,
  formatDate,
  money,
  today,
} from "../../features/administracion/utils";


export default function PagoCarpidasPage() {
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
    useState<CarpidasPendientesResponse | null>(
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
    async function loadCuentas() {
      try {
        setLoadingCuentas(true);

        const result =
          await getCuentasFinancieras();

        setCuentas(result);

        if (result.length === 1) {
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
        setLoadingCuentas(false);
      }
    }

    loadCuentas();
  }, []);


  // ============================================================
  // BUSCAR PENDIENTES
  // ============================================================

  async function buscar() {
    if (!fechaDesde) {
      setError(
        "Seleccioná una fecha desde.",
      );

      return;
    }

    if (!fechaHasta) {
      setError(
        "Seleccioná una fecha hasta.",
      );

      return;
    }

    if (
      fechaDesde >
      fechaHasta
    ) {
      setError(
        "La fecha desde no puede ser posterior a la fecha hasta.",
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await getCarpidasPendientes(
          fechaDesde,
          fechaHasta,
        );

      setData(result);

      // Por defecto quedan todas seleccionadas.
      setSelected(
        result.carpidas.map(
          (item) => item.id,
        ),
      );
    } catch (error: any) {
      console.error(error);

      setData(null);
      setSelected([]);

      setError(
        error?.response?.data
          ?.detail ??
          "No se pudieron consultar las carpidas pendientes.",
      );
    } finally {
      setLoading(false);
    }
  }


  // ============================================================
  // SELECCIONAR / DESELECCIONAR
  // ============================================================

  function toggle(
    id: number,
  ) {
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


  // ============================================================
  // SELECCIONAR TODAS
  // ============================================================

  function seleccionarTodas() {
    if (!data) {
      return;
    }

    setSelected(
      data.carpidas.map(
        (item) => item.id,
      ),
    );
  }


  // ============================================================
  // LIMPIAR SELECCION
  // ============================================================

  function limpiarSeleccion() {
    setSelected([]);
  }


  // ============================================================
  // TOTAL SELECCIONADO
  // ============================================================

  const total =
    useMemo(() => {
      if (!data) {
        return 0;
      }

      return data.carpidas
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
            acc +
            Number(
              item.importe,
            ),
          0,
        );
    }, [
      data,
      selected,
    ]);


  // ============================================================
  // PAGAR
  // ============================================================

  async function pagar() {
    if (!data) {
      return;
    }

    if (
      selected.length === 0
    ) {
      setError(
        "Seleccioná al menos una carpida.",
      );

      return;
    }

    if (!fechaPago) {
      setError(
        "Seleccioná la fecha de pago.",
      );

      return;
    }

    if (!cuentaFinanciera) {
      setError(
        "Seleccioná la cuenta desde donde se realiza el pago.",
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      await liquidarCarpidas({
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

        carpidas:
          selected,

        observacion:
          observacion.trim(),
      });

      // Recarga los pendientes.
      const result =
        await getCarpidasPendientes(
          fechaDesde,
          fechaHasta,
        );

      setData(result);

      setSelected(
        result.carpidas.map(
          (item) => item.id,
        ),
      );

      setObservacion("");
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data
          ?.detail ??
          "No se pudo registrar el pago de carpidas.",
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
          title="Pago de carpidas"
          description="
            Revisá las carpidas pendientes,
            seleccioná las que querés pagar
            y registrá la cuenta de origen.
          "
          icon={Sprout}
        />

        <AdministracionTabs
          pendientesTo="/administracion/carpidas"
          historialTo="/administracion/carpidas/historial"
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
                value={fechaDesde}
                onChange={(e) =>
                  setFechaDesde(
                    e.target.value,
                  )
                }
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-3
                  outline-none
                  transition
                  focus:border-emerald-500
                  disabled:bg-slate-100
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
                disabled={loading}
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-3
                  outline-none
                  transition
                  focus:border-emerald-500
                  disabled:bg-slate-100
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
              disabled:cursor-not-allowed
              disabled:opacity-50
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
              font-medium
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
                title="Pendientes"
                value={
                  String(
                    data.resumen
                      .cantidad_registros,
                  )
                }
                icon={Layers3}
              />

              <SummaryCard
                title="Total pendiente"
                value={
                  money(
                    data.resumen
                      .total,
                  )
                }
                icon={Sprout}
              />

              <SummaryCard
                title="Seleccionado"
                value={
                  money(
                    total,
                  )
                }
                icon={Check}
              />
            </div>

            {/* =================================================
                LISTADO
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
              {data.carpidas.length === 0
                ? (
                  <EmptyState
                    title="No hay carpidas pendientes"
                  />
                )
                : (
                  <>
                    {/* =========================================
                        ACCIONES SELECCION
                    ========================================= */}

                    <div
                      className="
                        mb-4
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <p
                        className="
                          text-sm
                          text-slate-500
                        "
                      >
                        {selected.length} de{" "}
                        {data.carpidas.length}{" "}
                        seleccionadas
                      </p>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <button
                          type="button"
                          onClick={
                            seleccionarTodas
                          }
                          disabled={
                            loading ||
                            selected.length ===
                              data.carpidas.length
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                            disabled:opacity-40
                          "
                        >
                          Seleccionar todas
                        </button>

                        <button
                          type="button"
                          onClick={
                            limpiarSeleccion
                          }
                          disabled={
                            loading ||
                            selected.length === 0
                          }
                          className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-slate-600
                            transition
                            hover:bg-slate-50
                            disabled:opacity-40
                          "
                        >
                          Limpiar
                        </button>
                      </div>
                    </div>

                    {/* =========================================
                        CARPIDAS
                    ========================================= */}

                    <div
                      className="
                        grid
                        grid-cols-1
                        gap-3
                        md:grid-cols-2
                      "
                    >
                      {data.carpidas.map(
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
                              disabled={loading}
                              className={`
                                rounded-2xl
                                border
                                p-4
                                text-left
                                transition
                                disabled:cursor-not-allowed
                                disabled:opacity-70

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
                                    min-w-0
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-2
                                    "
                                  >
                                    <p
                                      className="
                                        font-bold
                                        text-slate-900
                                      "
                                    >
                                      {
                                        item.tipo_jornada_display
                                      }
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
                                            : "border-slate-300 bg-white"
                                        }
                                      `}
                                    >
                                      {active && (
                                        <Check
                                          size={15}
                                        />
                                      )}
                                    </div>
                                  </div>

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
                                    shrink-0
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
                                    Jornal{" "}
                                    {money(
                                      item.valor_jornal,
                                    )}
                                  </p>
                                </div>
                              </div>

                              {item.observacion && (
                                <div
                                  className="
                                    mt-3
                                    rounded-xl
                                    bg-white/70
                                    px-3
                                    py-2
                                  "
                                >
                                  <p
                                    className="
                                      text-xs
                                      font-medium
                                      uppercase
                                      tracking-wide
                                      text-slate-400
                                    "
                                  >
                                    Observación
                                  </p>

                                  <p
                                    className="
                                      mt-1
                                      text-sm
                                      leading-5
                                      text-slate-600
                                    "
                                  >
                                    {
                                      item.observacion
                                    }
                                  </p>
                                </div>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  </>
                )}
            </section>

            {/* =================================================
                PAGO
            ================================================= */}

            {data.carpidas.length > 0 && (
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
                  {/* FECHA PAGO */}
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
                      disabled={loading}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-3
                        py-3
                        outline-none
                        transition
                        focus:border-emerald-500
                        disabled:bg-slate-100
                      "
                    />
                  </label>

                  {/* CUENTA */}
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
                        size={16}
                      />

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
                        loading ||
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
                        transition
                        focus:border-emerald-500
                        disabled:bg-slate-100
                        disabled:text-slate-500
                      "
                    >
                      <option value="">
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
                      onChange={(e) =>
                        setObservacion(
                          e.target.value,
                        )
                      }
                      disabled={loading}
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
                        transition
                        placeholder:text-slate-400
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
                    sm:items-end
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
                      {selected.length === 1
                        ? "1 carpida seleccionada"
                        : `${selected.length} carpidas seleccionadas`}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        font-medium
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      Total a pagar
                    </p>

                    <p
                      className="
                        mt-1
                        text-2xl
                        font-bold
                        tracking-tight
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
                    onClick={pagar}
                    disabled={
                      loading ||
                      loadingCuentas ||
                      selected.length === 0 ||
                      !cuentaFinanciera ||
                      total <= 0
                    }
                    className="
                      flex
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
                        size={18}
                        className="animate-spin"
                      />
                    )}

                    Confirmar pago
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}