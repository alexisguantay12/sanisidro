import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Edit3,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteMovimiento,
  getMovimientos,
  getResumenMovimientos,
} from "../api";

import type {
  MovimientoFinanciero,
  ResumenFinanciero,
} from "../types";

import MovimientoFormModal
  from "./MovimientoFormModal";

import MovimientoDeleteModal
  from "./MovimientoDeleteModal";

import CambioMonedaModal
  from "./CambioMonedaModal";

import FinanzasBackButton
  from "../FinanzasBackButton";


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


function moneyUSD(
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
      currency: "USD",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value ?? 0)
  );
}


function formatMoneyByCurrency(
  value:
    | string
    | number
    | null
    | undefined,
  currency:
    | "ARS"
    | "USD"
    | null
) {
  return currency === "USD"
    ? moneyUSD(value)
    : money(value);
}


function formatDate(
  value: string
) {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00Z`
    )
  );
}


export default function MovimientosPage() {

  const [
    movimientos,
    setMovimientos,
  ] = useState<
    MovimientoFinanciero[]
  >([]);


  const [
    resumen,
    setResumen,
  ] = useState<
    ResumenFinanciero | null
  >(null);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);


  const [
    cambioOpen,
    setCambioOpen,
  ] =
    useState(false);


  const [
    editing,
    setEditing,
  ] = useState<
    MovimientoFinanciero | null
  >(null);


  const [
    deleting,
    setDeleting,
  ] = useState<
    MovimientoFinanciero | null
  >(null);


  const [
    deleteLoading,
    setDeleteLoading,
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
    useState(true);


  const [
    loadingMore,
    setLoadingMore,
  ] =
    useState(false);


  const loadMoreRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const loadingMoreLock =
    useRef(false);


  async function loadData() {

    try {

      setLoading(true);

      setError("");

      loadingMoreLock.current =
        false;

      const [
        movimientosData,
        resumenData,
      ] =
        await Promise.all([
          getMovimientos({
            page: 1,
          }),

          getResumenMovimientos(),
        ]);

      setMovimientos(
        movimientosData.results
      );

      setHasMore(
        Boolean(
          movimientosData.next
        )
      );

      setPage(1);

      setResumen(
        resumenData
      );

    } catch (error) {

      console.error(
        error
      );

      setError(
        "No se pudieron cargar los movimientos."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadData();

  }, []);


  async function loadMore() {

    if (
      loadingMoreLock.current ||
      !hasMore ||
      loading
    ) {
      return;
    }

    loadingMoreLock.current =
      true;

    const nextPage =
      page + 1;

    try {

      setLoadingMore(true);

      const data =
        await getMovimientos({
          page:
            nextPage,
        });

      setMovimientos(
        (current) => [
          ...current,
          ...data.results,
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

    } catch (error) {

      console.error(
        "Error cargando más movimientos:",
        error
      );

    } finally {

      setLoadingMore(false);

      loadingMoreLock.current =
        false;

    }
  }


  useEffect(() => {

    const element =
      loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {

          const first =
            entries[0];

          if (
            first.isIntersecting &&
            hasMore &&
            !loading &&
            !loadingMoreLock.current
          ) {

            loadMore();

          }

        },
        {
          root: null,

          rootMargin:
            "150px 0px",

          threshold:
            0,
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
  ]);


  const filtered =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return movimientos;
      }

      return movimientos.filter(
        (item) =>

          item.descripcion
            .toLowerCase()
            .includes(query)

          ||

          (
            item.categoria_nombre ??
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          (
            item.cuenta_origen_nombre ??
            ""
          )
            .toLowerCase()
            .includes(query)

          ||

          (
            item.cuenta_destino_nombre ??
            ""
          )
            .toLowerCase()
            .includes(query)
      );

    }, [
      movimientos,
      search,
    ]);


  async function handleDelete() {

    if (!deleting) {
      return;
    }

    try {

      setDeleteLoading(true);

      await deleteMovimiento(
        deleting.id
      );

      setDeleting(
        null
      );

      await loadData();

    } catch (error) {

      console.error(error);

      setError(
        "No se pudo eliminar el movimiento."
      );

    } finally {

      setDeleteLoading(false);

    }
  }


  function renderIcon(
    item:
      MovimientoFinanciero
  ) {

    if (
      item.tipo ===
      "INGRESO"
    ) {

      return (
        <ArrowDownLeft
          size={18}
        />
      );

    }

    if (
      item.tipo ===
      "GASTO"
    ) {

      return (
        <ArrowUpRight
          size={18}
        />
      );

    }

    return (
      <ArrowRightLeft
        size={18}
      />
    );
  }


  function amountClass(
    item:
      MovimientoFinanciero
  ) {

    if (
      item.tipo ===
      "INGRESO"
    ) {
      return "text-emerald-700";
    }

    if (
      item.tipo ===
      "GASTO"
    ) {
      return "text-red-600";
    }

    return "text-[#49544E]";
  }


  function amountPrefix(
    item:
      MovimientoFinanciero
  ) {

    if (
      item.tipo ===
      "INGRESO"
    ) {
      return "+";
    }

    if (
      item.tipo ===
      "GASTO"
    ) {
      return "-";
    }

    return "";
  }


  return (
    <>

      <div className="min-h-full bg-[#F6F8F6]">

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

          <FinanzasBackButton />


          {/* HEADER */}

          <div className="mb-5 flex items-end justify-between gap-3">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
                Finanzas
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
                Movimientos
              </h1>

              <p className="mt-2 hidden text-sm text-[#78817B] sm:block">
                Ingresos, gastos, transferencias y cambios de moneda.
              </p>

            </div>


            <div className="flex shrink-0 gap-2">

              <button
                type="button"
                onClick={() =>
                  setCambioOpen(
                    true
                  )
                }
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D7DFDA] bg-white px-3 text-sm font-semibold text-[#18392B] active:scale-[0.98] sm:px-4"
              >

                <ArrowRightLeft
                  size={18}
                />

                <span className="hidden sm:inline">
                  Cambiar moneda
                </span>

                <span className="sm:hidden">
                  Cambio
                </span>

              </button>


              <button
                type="button"
                onClick={() =>
                  setCreateOpen(
                    true
                  )
                }
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#18392B] px-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] active:scale-[0.98] sm:px-5"
              >

                <Plus
                  size={19}
                />

                <span className="hidden sm:inline">
                  Nuevo movimiento
                </span>

                <span className="sm:hidden">
                  Nuevo
                </span>

              </button>

            </div>

          </div>


          {/* RESUMEN */}

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div className="rounded-[22px] border border-[#E4E8E5] bg-white p-4">

              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                Ingresos
              </p>

              <p className="mt-2 truncate text-lg font-semibold text-emerald-700 sm:text-xl">
                {money(
                  resumen?.ingresos
                )}
              </p>

            </div>


            <div className="rounded-[22px] border border-[#E4E8E5] bg-white p-4">

              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                Gastos
              </p>

              <p className="mt-2 truncate text-lg font-semibold text-red-600 sm:text-xl">
                {money(
                  resumen?.gastos
                )}
              </p>

            </div>


            <div className="col-span-2 rounded-[22px] bg-[#18392B] p-4 text-white sm:col-span-1">

              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
                Resultado
              </p>

              <p className="mt-2 truncate text-lg font-semibold sm:text-xl">
                {money(
                  resumen?.resultado
                )}
              </p>

            </div>

          </div>


          {/* SEARCH */}

          <div className="mb-4 rounded-[22px] border border-[#E4E8E5] bg-white p-3">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA29D]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Buscar movimiento..."
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] pl-11 pr-4 text-base outline-none focus:border-[#9FB4A6] focus:bg-white"
              />

            </div>

          </div>


          {error && (

            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>

          )}


          {/* MOBILE */}

          <div className="space-y-3 md:hidden">

            {!loading &&
              filtered.map(
                (item) => {

                  const saldo =
                    item.tipo ===
                    "INGRESO"
                      ? item.saldo_cuenta_destino
                      : item.saldo_cuenta_origen;

                  const cuenta =
                    item.tipo ===
                    "INGRESO"
                      ? item.cuenta_destino_nombre
                      : item.cuenta_origen_nombre;

                  return (

                    <div
                      key={
                        item.id
                      }
                      className="rounded-[22px] border border-[#E4E8E5] bg-white p-4 shadow-[0_5px_20px_rgba(27,30,28,0.035)]"
                    >

                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            item.tipo ===
                            "INGRESO"
                              ? "bg-emerald-50 text-emerald-700"
                              : item.tipo ===
                                "GASTO"
                                ? "bg-red-50 text-red-600"
                                : item.tipo ===
                                  "CAMBIO_MONEDA"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >

                          {renderIcon(
                            item
                          )}

                        </div>


                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-[#242925]">
                                {item.descripcion}
                              </p>

                              <p className="mt-1 text-xs text-[#8A938D]">

                                {formatDate(
                                  item.fecha
                                )}

                                {item.categoria_nombre
                                  ? ` · ${item.categoria_nombre}`
                                  : ""}

                              </p>

                            </div>


                            {item.tipo ===
                            "CAMBIO_MONEDA" ? (

                              <p className="shrink-0 text-sm font-semibold text-amber-700">
                                Cambio
                              </p>

                            ) : (

                              <p
                                className={`shrink-0 text-base font-semibold ${amountClass(
                                  item
                                )}`}
                              >

                                {amountPrefix(
                                  item
                                )}

                                {formatMoneyByCurrency(
                                  item.monto,

                                  item.tipo ===
                                  "INGRESO"
                                    ? item.cuenta_destino_moneda
                                    : item.cuenta_origen_moneda
                                )}

                              </p>

                            )}

                          </div>


                          {item.tipo ===
                          "CAMBIO_MONEDA" ? (

                            <div className="mt-3 rounded-2xl bg-[#F6F8F6] p-3">

                              <p className="text-xs font-medium text-[#6D7770]">

                                {item.cuenta_origen_nombre}

                                {" → "}

                                {item.cuenta_destino_nombre}

                              </p>


                              <div className="mt-3 grid grid-cols-2 gap-3">

                                <div>

                                  <p className="text-[10px] uppercase text-[#9AA29D]">
                                    Sale
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-red-600">

                                    {formatMoneyByCurrency(
                                      item.monto,
                                      item.cuenta_origen_moneda
                                    )}

                                  </p>

                                </div>


                                <div>

                                  <p className="text-[10px] uppercase text-[#9AA29D]">
                                    Entra
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-emerald-700">

                                    {formatMoneyByCurrency(
                                      item.monto_destino,
                                      item.cuenta_destino_moneda
                                    )}

                                  </p>

                                </div>

                              </div>


                              <div className="mt-3 border-t border-[#E5EAE7] pt-2">

                                <p className="text-xs text-[#7D8780]">

                                  Cotización:{" "}

                                  <span className="font-semibold text-[#444B47]">
                                    {money(
                                      item.cotizacion
                                    )}
                                    {" / USD"}
                                  </span>

                                </p>

                              </div>


                              <div className="mt-3 grid grid-cols-2 gap-3">

                                <div>

                                  <p className="text-[10px] uppercase text-[#9AA29D]">
                                    Saldo origen
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-[#444B47]">

                                    {formatMoneyByCurrency(
                                      item.saldo_cuenta_origen,
                                      item.cuenta_origen_moneda
                                    )}

                                  </p>

                                </div>


                                <div>

                                  <p className="text-[10px] uppercase text-[#9AA29D]">
                                    Saldo destino
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-[#444B47]">

                                    {formatMoneyByCurrency(
                                      item.saldo_cuenta_destino,
                                      item.cuenta_destino_moneda
                                    )}

                                  </p>

                                </div>

                              </div>

                            </div>

                          ) : item.tipo ===
                          "TRANSFERENCIA" ? (

                            <div className="mt-3 rounded-2xl bg-[#F6F8F6] p-3">

                              <p className="text-xs text-[#768079]">

                                {item.cuenta_origen_nombre}

                                {" → "}

                                {item.cuenta_destino_nombre}

                              </p>


                              <div className="mt-2 grid grid-cols-2 gap-2">

                                <div>

                                  <p className="text-[10px] uppercase text-[#9AA29D]">
                                    Saldo origen
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-[#444B47]">

                                    {formatMoneyByCurrency(
                                      item.saldo_cuenta_origen,
                                      item.cuenta_origen_moneda
                                    )}

                                  </p>

                                </div>


                                <div>

                                  <p className="text-[10px] uppercase text-[#9AA29D]">
                                    Saldo destino
                                  </p>

                                  <p className="mt-0.5 text-sm font-semibold text-[#444B47]">

                                    {formatMoneyByCurrency(
                                      item.saldo_cuenta_destino,
                                      item.cuenta_destino_moneda
                                    )}

                                  </p>

                                </div>

                              </div>

                            </div>

                          ) : (

                            <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F6F8F6] px-3 py-2.5">

                              <p className="truncate text-xs font-medium text-[#6D7770]">
                                {cuenta}
                              </p>

                              <div className="ml-3 text-right">

                                <p className="text-[10px] uppercase tracking-[0.06em] text-[#9AA29D]">
                                  Saldo
                                </p>

                                <p className="text-sm font-semibold text-[#333936]">

                                  {formatMoneyByCurrency(
                                    saldo,

                                    item.tipo ===
                                    "INGRESO"
                                      ? item.cuenta_destino_moneda
                                      : item.cuenta_origen_moneda
                                  )}

                                </p>

                              </div>

                            </div>

                          )}


                          <div className="mt-3 flex justify-end gap-1 border-t border-[#EEF1EF] pt-3">

                            {item.tipo !==
                              "CAMBIO_MONEDA" && (

                              <button
                                type="button"
                                onClick={() =>
                                  setEditing(
                                    item
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#68716B] hover:bg-[#EEF3EF]"
                              >

                                <Edit3
                                  size={16}
                                />

                              </button>

                            )}


                            <button
                              type="button"
                              onClick={() =>
                                setDeleting(
                                  item
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
                            >

                              <Trash2
                                size={16}
                              />

                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  );

                }
              )}

          </div>


          {/* DESKTOP */}

          {!loading && (

            <div className="hidden overflow-hidden rounded-[24px] border border-[#E4E8E5] bg-white md:block">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-[#FAFBFA]">

                    <tr className="border-b border-[#E8ECE9]">

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#8B948E]">
                        Fecha
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#8B948E]">
                        Movimiento
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#8B948E]">
                        Categoría
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#8B948E]">
                        Cuenta
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-[#8B948E]">
                        Monto
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-[#8B948E]">
                        Saldo
                      </th>

                      <th className="px-5 py-4"></th>

                    </tr>

                  </thead>


                  <tbody>

                    {filtered.map(
                      (item) => {

                        const cuenta =
                          item.tipo ===
                          "INGRESO"
                            ? item.cuenta_destino_nombre
                            : item.tipo ===
                              "GASTO"
                              ? item.cuenta_origen_nombre
                              : `${item.cuenta_origen_nombre} → ${item.cuenta_destino_nombre}`;


                        const saldo =
                          item.tipo ===
                          "INGRESO"
                            ? item.saldo_cuenta_destino
                            : item.saldo_cuenta_origen;


                        return (

                          <tr
                            key={
                              item.id
                            }
                            className="border-b border-[#EEF1EF] last:border-0 hover:bg-[#FAFBFA]"
                          >

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-[#68716B]">

                              {formatDate(
                                item.fecha
                              )}

                            </td>


                            <td className="px-5 py-4">

                              <p className="font-semibold text-[#292E2B]">
                                {item.descripcion}
                              </p>

                              <p className="mt-1 text-xs text-[#929A95]">
                                {item.tipo_display}
                              </p>

                              {item.tipo ===
                                "CAMBIO_MONEDA"
                                &&
                                item.cotizacion && (

                                <p className="mt-1 text-xs text-[#929A95]">

                                  Cotización{" "}

                                  {money(
                                    item.cotizacion
                                  )}

                                  {" / USD"}

                                </p>

                              )}

                            </td>


                            <td className="px-5 py-4 text-sm text-[#68716B]">

                              {
                                item.categoria_nombre ??
                                "—"
                              }

                            </td>


                            <td className="px-5 py-4 text-sm text-[#68716B]">
                              {cuenta}
                            </td>


                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm">

                              {item.tipo ===
                              "CAMBIO_MONEDA" ? (

                                <div>

                                  <p className="font-semibold text-red-600">

                                    -{
                                      formatMoneyByCurrency(
                                        item.monto,
                                        item.cuenta_origen_moneda
                                      )
                                    }

                                  </p>

                                  <p className="mt-1 font-semibold text-emerald-700">

                                    +{
                                      formatMoneyByCurrency(
                                        item.monto_destino,
                                        item.cuenta_destino_moneda
                                      )
                                    }

                                  </p>

                                </div>

                              ) : (

                                <span
                                  className={
                                    amountClass(
                                      item
                                    )
                                  }
                                >

                                  {amountPrefix(
                                    item
                                  )}

                                  {formatMoneyByCurrency(
                                    item.monto,

                                    item.tipo ===
                                    "INGRESO"
                                      ? item.cuenta_destino_moneda
                                      : item.cuenta_origen_moneda
                                  )}

                                </span>

                              )}

                            </td>


                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-[#333936]">

                              {item.tipo ===
                              "CAMBIO_MONEDA" ? (

                                <div>

                                  <p>

                                    {formatMoneyByCurrency(
                                      item.saldo_cuenta_origen,
                                      item.cuenta_origen_moneda
                                    )}

                                  </p>

                                  <p className="mt-1 text-xs text-[#7D8780]">

                                    {formatMoneyByCurrency(
                                      item.saldo_cuenta_destino,
                                      item.cuenta_destino_moneda
                                    )}

                                  </p>

                                </div>

                              ) : (

                                formatMoneyByCurrency(
                                  saldo,

                                  item.tipo ===
                                  "INGRESO"
                                    ? item.cuenta_destino_moneda
                                    : item.cuenta_origen_moneda
                                )

                              )}

                            </td>


                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-1">

                                {item.tipo !==
                                  "CAMBIO_MONEDA" && (

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditing(
                                        item
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-[#68716B] hover:bg-[#EEF3EF]"
                                  >

                                    <Edit3
                                      size={16}
                                    />

                                  </button>

                                )}


                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleting(
                                      item
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50"
                                >

                                  <Trash2
                                    size={16}
                                  />

                                </button>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}


          {/* INFINITE SCROLL */}

          <div
            ref={
              loadMoreRef
            }
            className="py-6"
          >

            {loadingMore && (

              <div className="flex items-center justify-center gap-3 text-sm text-[#7B847E]">

                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D9E0DB] border-t-[#18392B]" />

                Cargando más movimientos...

              </div>

            )}


            {!hasMore &&
              movimientos.length > 0 && (

              <p className="text-center text-xs font-medium text-[#9AA29D]">
                Todos los movimientos cargados
              </p>

            )}

          </div>

        </div>

      </div>


      {/* CREAR */}

      <MovimientoFormModal
        open={
          createOpen
        }
        onClose={() =>
          setCreateOpen(
            false
          )
        }
        onSuccess={async () => {

          setCreateOpen(
            false
          );

          await loadData();

        }}
      />


      {/* CAMBIAR MONEDA */}

      <CambioMonedaModal
        open={
          cambioOpen
        }
        onClose={() =>
          setCambioOpen(
            false
          )
        }
        onSuccess={async () => {

          setCambioOpen(
            false
          );

          await loadData();

        }}
      />


      {/* EDITAR */}

      <MovimientoFormModal
        open={
          editing !== null
        }
        movimiento={
          editing
        }
        onClose={() =>
          setEditing(
            null
          )
        }
        onSuccess={async () => {

          setEditing(
            null
          );

          await loadData();

        }}
      />


      {/* ELIMINAR */}

      <MovimientoDeleteModal
        open={
          deleting !== null
        }
        movimiento={
          deleting
        }
        loading={
          deleteLoading
        }
        onCancel={() =>
          setDeleting(
            null
          )
        }
        onConfirm={
          handleDelete
        }
      />

    </>
  );
}