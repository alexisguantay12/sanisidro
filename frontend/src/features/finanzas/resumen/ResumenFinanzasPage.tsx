import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  TrendingUp,
  WalletCards,
} from "lucide-react";

import {
  getResumenMovimientos,
} from "../api";

import type {
  ResumenFinanciero,
} from "../types";


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


function getMonthRange(
  year: number,
  month: number
) {

  const lastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  const monthString =
    String(month).padStart(
      2,
      "0"
    );

  return {
    desde:
      `${year}-${monthString}-01`,

    hasta:
      `${year}-${monthString}-${String(
        lastDay
      ).padStart(
        2,
        "0"
      )}`,
  };
}


export default function ResumenFinanzasPage() {

  const now =
    new Date();


  const [
    year,
    setYear,
  ] =
    useState(
      now.getFullYear()
    );


  const [
    month,
    setMonth,
  ] =
    useState(
      now.getMonth() + 1
    );


  const [
    resumen,
    setResumen,
  ] =
    useState<
      ResumenFinanciero | null
    >(null);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {

    load();

  }, [
    year,
    month,
  ]);


  async function load() {

    const range =
      getMonthRange(
        year,
        month
      );


    const params = {
      fecha_desde:
        range.desde,

      fecha_hasta:
        range.hasta,
    };


    try {

      setLoading(true);
      setError("");


      const resumenData =
        await getResumenMovimientos(
          params
        );


      setResumen(
        resumenData
      );


    } catch (error) {

      console.error(
        "Error cargando resumen financiero:",
        error
      );


      setError(
        "No se pudo cargar el resumen financiero."
      );


    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#89928C]">
          Finanzas
        </p>

        <h1 className="mt-1 text-3xl font-semibold">
          Resumen
        </h1>

        <p className="mt-2 text-sm text-[#747D77]">
          Ingresos y egresos del período.
        </p>

      </header>



      {/* ===================================================
          FILTRO PERÍODO
      =================================================== */}

      <div className="mt-6 flex flex-wrap gap-3 rounded-[22px] border border-[#E2E7E3] bg-white p-4">

        <div className="flex items-center gap-2 text-[#69726C]">

          <CalendarDays
            size={19}
          />

        </div>


        <select
          value={month}
          onChange={(event) =>
            setMonth(
              Number(
                event.target.value
              )
            )
          }
          className="h-11 flex-1 rounded-xl border border-[#DDE3DF] px-3 sm:flex-none"
        >

          {months.map(
            (
              name,
              index
            ) => (

              <option
                key={name}
                value={
                  index + 1
                }
              >
                {name}
              </option>

            )
          )}

        </select>


        <select
          value={year}
          onChange={(event) =>
            setYear(
              Number(
                event.target.value
              )
            )
          }
          className="h-11 rounded-xl border border-[#DDE3DF] px-3"
        >

          {[
            2025,
            2026,
            2027,
            2028,
          ].map(
            (value) => (

              <option
                key={value}
                value={value}
              >
                {value}
              </option>

            )
          )}

        </select>

      </div>



      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>

      )}



      {/* ===================================================
          TARJETAS RESUMEN
      =================================================== */}

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <SummaryCard
          icon={
            <ArrowDownLeft />
          }
          label="Ingresos"
          value={money(
            resumen?.ingresos ??
              0
          )}
          valueClass="text-emerald-700"
        />


        <SummaryCard
          icon={
            <ArrowUpRight />
          }
          label="Gastos"
          value={money(
            resumen?.gastos ??
              0
          )}
          valueClass="text-red-600"
        />


        <SummaryCard
          icon={
            <TrendingUp />
          }
          label="Resultado"
          value={money(
            resumen?.resultado ??
              0
          )}
          valueClass="text-[#18392B]"
        />


        <SummaryCard
          icon={
            <WalletCards />
          }
          label="Transferencias"
          value={money(
            resumen?.transferencias ??
              0
          )}
          valueClass="text-[#59655E]"
        />

      </div>



      {/* ===================================================
          AGRUPACIONES
      =================================================== */}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">

        <GroupBox
          title="Ingresos por grupo"
          rows={
            resumen?.ingresos_por_grupo ??
            []
          }
          emptyText="Sin ingresos este mes."
        />


        <GroupBox
          title="Gastos por grupo"
          rows={
            resumen?.gastos_por_grupo ??
            []
          }
          emptyText="Sin gastos este mes."
        />

      </div>



      {/* ===================================================
          LOADING
      =================================================== */}

      {loading && (

        <p className="mt-5 text-sm text-[#89928C]">
          Actualizando...
        </p>

      )}

    </div>

  );
}


function SummaryCard({

  icon,
  label,
  value,
  valueClass,

}: {

  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;

  valueClass:
    string;

}) {

  return (

    <div className="rounded-[22px] border border-[#E2E7E3] bg-white p-4">

      <div className="flex items-center gap-2 text-[#858E88]">

        <div className="[&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </div>

        <p className="text-xs font-semibold uppercase">
          {label}
        </p>

      </div>


      <p
        className={`mt-3 truncate text-lg font-semibold sm:text-xl ${valueClass}`}
      >
        {value}
      </p>

    </div>

  );
}


function GroupBox({

  title,
  rows,
  emptyText,

}: {

  title:
    string;

  rows: {
    nombre:
      string;

    total:
      string | number;
  }[];

  emptyText:
    string;

}) {

  return (

    <div className="rounded-[24px] border border-[#E2E7E3] bg-white p-5">

      <h2 className="font-semibold">
        {title}
      </h2>


      <div className="mt-4 space-y-3">

        {rows.length === 0 ? (

          <p className="text-sm text-[#89928C]">
            {emptyText}
          </p>

        ) : (

          rows.map(
            (row) => (

              <div
                key={
                  row.nombre
                }
                className="flex items-center justify-between gap-4 border-b border-[#EEF1EF] pb-3 last:border-0"
              >

                <span className="text-sm text-[#626B65]">
                  {row.nombre}
                </span>


                <strong className="text-sm">
                  {money(
                    row.total
                  )}
                </strong>

              </div>

            )
          )

        )}

      </div>

    </div>

  );
}


const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];