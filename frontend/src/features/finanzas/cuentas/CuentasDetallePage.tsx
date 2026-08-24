import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Landmark,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getCuentaMovimientos,
} from "../api";

import type {
  CuentaFinanciera,
  MovimientoFinanciero,
} from "../types";


function money(
  value:
    | string
    | number
    | null
) {

  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(
      value ?? 0
    )
  );
}


function date(
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


export default function CuentaDetallePage() {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

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


  useEffect(() => {

    if (!id) {
      return;
    }

    load();

  }, [id]);


  async function load() {

    if (!id) {
      return;
    }

    try {

      setLoading(true);

      const data =
        await getCuentaMovimientos(
          Number(id)
        );

      setCuenta(
        data.cuenta
      );

      setMovimientos(
        data.movimientos
      );

    } finally {

      setLoading(false);

    }
  }


  const items =
    useMemo(() => {

      if (!cuenta) {
        return [];
      }

      return movimientos.map(
        (item) => {

          const ingreso =
            item.cuenta_destino ===
            cuenta.id;

          const saldo =
            ingreso
              ? item.saldo_cuenta_destino
              : item.saldo_cuenta_origen;

          return {
            item,
            ingreso,
            saldo,
          };
        }
      );

    }, [
      movimientos,
      cuenta,
    ]);


  if (
    loading ||
    !cuenta
  ) {

    return (
      <div className="p-6 text-sm text-[#778079]">
        Cargando cuenta...
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

      <button
        type="button"
        onClick={() =>
          navigate(
            "/finanzas/cuentas"
          )
        }
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#68716B]"
      >
        <ArrowLeft size={18} />
        Cuentas
      </button>


      <div className="rounded-[26px] bg-[#18392B] p-5 text-white sm:p-7">

        <div className="flex items-center gap-4">

          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/10">
            <Landmark
              size={25}
            />
          </div>

          <div>

            <h1 className="text-2xl font-semibold">
              {cuenta.nombre}
            </h1>

            <p className="mt-1 text-sm text-white/60">
              {
                cuenta.tipo_display
              }
            </p>

          </div>

        </div>

        <div className="mt-7">

          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/60">
            Saldo actual
          </p>

          <p className="mt-2 text-3xl font-semibold">
            {money(
              cuenta.saldo_actual
            )}
          </p>

        </div>

      </div>


      <div className="mt-6">

        <h2 className="text-lg font-semibold">
          Historial
        </h2>

        <p className="mt-1 text-sm text-[#7A837D]">
          Evolución del saldo movimiento por movimiento.
        </p>

      </div>


      <div className="mt-4 space-y-3 md:hidden">

        {items.map(
          ({
            item,
            ingreso,
            saldo,
          }) => (

            <div
              key={item.id}
              className="rounded-[22px] border border-[#E2E7E3] bg-white p-4"
            >

              <div className="flex gap-3">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    ingreso
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {item.tipo ===
                  "TRANSFERENCIA" ? (
                    <ArrowRightLeft
                      size={18}
                    />
                  ) : ingreso ? (
                    <ArrowDownLeft
                      size={18}
                    />
                  ) : (
                    <ArrowUpRight
                      size={18}
                    />
                  )}
                </div>


                <div className="min-w-0 flex-1">

                  <div className="flex justify-between gap-3">

                    <div>

                      <p className="font-semibold">
                        {
                          item.descripcion
                        }
                      </p>

                      <p className="mt-1 text-xs text-[#8B948E]">
                        {date(
                          item.fecha
                        )}
                      </p>

                    </div>


                    <p
                      className={`font-semibold ${
                        ingreso
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {ingreso
                        ? "+"
                        : "-"}
                      {money(
                        item.monto
                      )}
                    </p>

                  </div>


                  <div className="mt-3 flex justify-between rounded-xl bg-[#F6F8F6] px-3 py-2">

                    <span className="text-xs text-[#858E88]">
                      Saldo
                    </span>

                    <strong className="text-sm">
                      {money(saldo)}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>


      <div className="mt-4 hidden overflow-hidden rounded-[24px] border border-[#E2E7E3] bg-white md:block">

        <table className="w-full">

          <thead className="bg-[#FAFBFA]">

            <tr>
              <th className={th}>
                Fecha
              </th>

              <th className={th}>
                Movimiento
              </th>

              <th className={`${th} text-right`}>
                Monto
              </th>

              <th className={`${th} text-right`}>
                Saldo
              </th>
            </tr>

          </thead>

          <tbody>

            {items.map(
              ({
                item,
                ingreso,
                saldo,
              }) => (

                <tr
                  key={item.id}
                  className="border-t border-[#EEF1EF]"
                >

                  <td className={td}>
                    {date(
                      item.fecha
                    )}
                  </td>

                  <td className={td}>

                    <p className="font-semibold text-[#292E2B]">
                      {
                        item.descripcion
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#8B948E]">
                      {
                        item.tipo_display
                      }
                    </p>

                  </td>

                  <td
                    className={`${td} text-right font-semibold ${
                      ingreso
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {ingreso
                      ? "+"
                      : "-"}
                    {money(
                      item.monto
                    )}
                  </td>

                  <td className={`${td} text-right font-semibold`}>
                    {money(saldo)}
                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}


const th =
  "px-5 py-4 text-left text-xs font-semibold uppercase text-[#8B948E]";

const td =
  "px-5 py-4 text-sm text-[#606963]";