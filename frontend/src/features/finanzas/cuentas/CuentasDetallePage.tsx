import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Landmark,
  Loader2,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import {
  getCuentaMovimientos,
} from "../api";

import type {
  CuentaFinanciera,
  MovimientoFinanciero,
} from "../types";

import FinanzasBackButton from "../FinanzasBackButton";

function money(
  value:
    | string
    | number
    | null
    | undefined
) {

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value ?? 0)
  );
}


function formatDate(
  value: string
) {

  const [
    year,
    month,
    day,
  ] = value.split("-");

  return `${day}/${month}/${year}`;
}


export default function CuentaDetallePage() {

  const {
    id,
  } = useParams();


  const cuentaId =
    Number(id);


  const [
    cuenta,
    setCuenta,
  ] =
    useState<
      CuentaFinanciera | null
    >(null);


  const [
    movimientos,
    setMovimientos,
  ] =
    useState<
      MovimientoFinanciero[]
    >([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    loadingMore,
    setLoadingMore,
  ] =
    useState(false);


  const [
    page,
    setPage,
  ] =
    useState(1);


  const [
    hasMore,
    setHasMore,
  ] =
    useState(false);


  const [
    totalMovimientos,
    setTotalMovimientos,
  ] =
    useState(0);


  const [
    error,
    setError,
  ] =
    useState("");


  const loadMoreRef =
    useRef<HTMLDivElement | null>(
      null
    );


  // ========================================================
  // CARGA INICIAL
  // ========================================================

  useEffect(() => {

    if (
      !cuentaId ||
      Number.isNaN(cuentaId)
    ) {
      return;
    }

    loadInitial();

  }, [
    cuentaId,
  ]);


  async function loadInitial() {

    try {

      setLoading(true);
      setError("");


      const data =
        await getCuentaMovimientos(
          cuentaId,
          1
        );


      setCuenta(
        data.results.cuenta
      );


      setMovimientos(
        data.results.movimientos
      );


      setPage(1);


      setHasMore(
        Boolean(
          data.next
        )
      );


      setTotalMovimientos(
        data.count
      );


    } catch (error) {

      console.error(
        "Error cargando detalle de cuenta:",
        error
      );


      setError(
        "No se pudo cargar la cuenta."
      );


    } finally {

      setLoading(false);

    }

  }


  // ========================================================
  // CARGAR SIGUIENTES 30
  // ========================================================

  async function loadMore() {

    if (
      loading ||
      loadingMore ||
      !hasMore
    ) {
      return;
    }


    const nextPage =
      page + 1;


    try {

      setLoadingMore(true);


      const data =
        await getCuentaMovimientos(
          cuentaId,
          nextPage
        );


      setMovimientos(
        (current) => [
          ...current,
          ...data.results.movimientos,
        ]
      );


      setPage(
        nextPage
      );


      setHasMore(
        Boolean(
          data.next
        )
      );


      setTotalMovimientos(
        data.count
      );


    } catch (error) {

      console.error(
        "Error cargando más movimientos:",
        error
      );


    } finally {

      setLoadingMore(false);

    }

  }


  // ========================================================
  // INFINITE SCROLL
  // ========================================================

  useEffect(() => {

    const element =
      loadMoreRef.current;


    if (!element) {
      return;
    }


    const observer =
      new IntersectionObserver(
        (entries) => {

          const entry =
            entries[0];


          if (
            entry.isIntersecting &&
            hasMore &&
            !loading &&
            !loadingMore
          ) {

            loadMore();

          }

        },
        {
          root: null,

          // Empieza a cargar antes
          // de que el usuario llegue
          // exactamente al final.
          rootMargin:
            "300px 0px",

          threshold: 0,
        }
      );


    observer.observe(
      element
    );


    return () => {

      observer.disconnect();

    };

  }, [
    page,
    hasMore,
    loading,
    loadingMore,
    cuentaId,
  ]);


  // ========================================================
  // LOADING INICIAL
  // ========================================================

  if (loading) {

    return (

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

        <FinanzasBackButton />

        <div className="mt-10 flex items-center justify-center gap-3 text-sm text-[#7B847E]">

          <Loader2
            size={20}
            className="animate-spin"
          />

          Cargando cuenta...

        </div>

      </div>

    );

  }


  // ========================================================
  // ERROR
  // ========================================================

  if (
    error ||
    !cuenta
  ) {

    return (

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

        <FinanzasBackButton />

        <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error ||
            "No se encontró la cuenta."}
        </div>

      </div>

    );

  }


  return (

    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

      <FinanzasBackButton />


      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="mt-4">

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#89928C]">
          Finanzas · Cuenta
        </p>


        <div className="mt-2 flex items-center gap-3">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2ED] text-[#18392B]">

            <Landmark
              size={22}
            />

          </div>


          <div className="min-w-0">

            <h1 className="truncate text-2xl font-semibold sm:text-3xl">
              {cuenta.nombre}
            </h1>

            <p className="mt-1 text-sm text-[#89928C]">
              {cuenta.tipo_display}
            </p>

          </div>

        </div>

      </header>


      {/* ===================================================
          SALDO
      =================================================== */}

      <section className="mt-6 rounded-[24px] bg-[#18392B] p-5 text-white sm:p-6">

        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
          Saldo actual
        </p>


        <p className="mt-2 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
          {money(
            cuenta.saldo_actual
          )}
        </p>


        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

          <span className="text-xs text-white/60">
            Saldo inicial
          </span>

          <strong className="text-sm">
            {money(
              cuenta.saldo_inicial
            )}
          </strong>

        </div>

      </section>


      {/* ===================================================
          CABECERA HISTORIAL
      =================================================== */}

      <div className="mt-7 flex items-end justify-between gap-4">

        <div>

          <h2 className="text-lg font-semibold">
            Historial
          </h2>

          <p className="mt-1 text-sm text-[#89928C]">
            Movimientos de esta cuenta
          </p>

        </div>


        <span className="shrink-0 rounded-full bg-[#EEF3EF] px-3 py-1.5 text-xs font-semibold text-[#59645D]">

          {totalMovimientos} movimientos

        </span>

      </div>


      {/* ===================================================
          SIN MOVIMIENTOS
      =================================================== */}

      {movimientos.length === 0 && (

        <div className="mt-5 rounded-[22px] border border-[#E2E7E3] bg-white p-8 text-center">

          <p className="text-sm font-medium text-[#69726C]">
            Esta cuenta todavía no tiene movimientos.
          </p>

        </div>

      )}


      {/* ===================================================
          LISTADO
      =================================================== */}

      <div className="mt-4 space-y-3">

        {movimientos.map(
          (movimiento) => {

            const esIngreso =
              movimiento.tipo ===
              "INGRESO";


            const esGasto =
              movimiento.tipo ===
              "GASTO";


            const entraACuenta =
              movimiento.cuenta_destino ===
              cuenta.id;


            const saleDeCuenta =
              movimiento.cuenta_origen ===
              cuenta.id;


            let saldoResultante:
              | string
              | number
              | null
              | undefined;


            if (entraACuenta) {

              saldoResultante =
                movimiento
                  .saldo_cuenta_destino;

            } else if (saleDeCuenta) {

              saldoResultante =
                movimiento
                  .saldo_cuenta_origen;

            }


            return (

              <article
                key={
                  movimiento.id
                }
                className="rounded-[22px] border border-[#E3E8E4] bg-white p-4 shadow-[0_3px_14px_rgba(20,30,24,0.035)] sm:p-5"
              >

                <div className="flex items-start gap-3">

                  {/* ICONO */}

                  <div
                    className={
                      `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        esIngreso
                          ? "bg-emerald-50 text-emerald-700"
                          : esGasto
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                      }`
                    }
                  >

                    {esIngreso ? (

                      <ArrowDownLeft
                        size={20}
                      />

                    ) : esGasto ? (

                      <ArrowUpRight
                        size={20}
                      />

                    ) : (

                      <ArrowRightLeft
                        size={20}
                      />

                    )}

                  </div>


                  {/* INFORMACIÓN */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="truncate font-semibold text-[#202923]">
                          {movimiento.descripcion}
                        </h3>


                        <p className="mt-1 text-xs text-[#89928C]">

                          {formatDate(
                            movimiento.fecha
                          )}

                          {movimiento.categoria_nombre &&
                            ` · ${movimiento.categoria_nombre}`}

                        </p>

                      </div>


                      {/* MONTO */}

                      <p
                        className={
                          `shrink-0 text-right font-semibold ${
                            entraACuenta
                              ? "text-emerald-700"
                              : saleDeCuenta
                                ? "text-red-600"
                                : "text-[#243129]"
                          }`
                        }
                      >

                        {entraACuenta
                          ? "+"
                          : saleDeCuenta
                            ? "-"
                            : ""}

                        {money(
                          movimiento.monto
                        )}

                      </p>

                    </div>


                    {/* TRANSFERENCIA */}

                    {movimiento.tipo ===
                      "TRANSFERENCIA" && (

                      <div className="mt-3 rounded-xl bg-[#F6F8F6] px-3 py-2 text-xs text-[#737D76]">

                        {movimiento.cuenta_origen_nombre}

                        <span className="mx-2">
                          →
                        </span>

                        {movimiento.cuenta_destino_nombre}

                      </div>

                    )}


                    {/* SALDO RESULTANTE */}

                    {saldoResultante != null && (

                      <div className="mt-3 flex items-center justify-between border-t border-[#EEF1EF] pt-3">

                        <span className="text-xs text-[#919A94]">
                          Saldo después del movimiento
                        </span>

                        <strong className="text-sm text-[#354139]">
                          {money(
                            saldoResultante
                          )}
                        </strong>

                      </div>

                    )}

                  </div>

                </div>

              </article>

            );

          }
        )}

      </div>


      {/* ===================================================
          SENSOR INFINITE SCROLL
      =================================================== */}

      <div
        ref={
          loadMoreRef
        }
        className="py-7"
      >

        {loadingMore && (

          <div className="flex items-center justify-center gap-3 text-sm text-[#7B847E]">

            <Loader2
              size={20}
              className="animate-spin"
            />

            Cargando más movimientos...

          </div>

        )}


        {!hasMore &&
          movimientos.length > 0 && (

          <div className="text-center">

            <p className="text-xs font-medium text-[#9AA29D]">
              Todos los movimientos cargados
            </p>

            <p className="mt-1 text-[11px] text-[#ADB4AF]">
              {movimientos.length} de {totalMovimientos}
            </p>

          </div>

        )}

      </div>

    </div>

  );
}