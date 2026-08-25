import {
  useEffect,
  useState,
} from "react";

import {
  Edit3,
  Landmark,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  deleteCuenta,
  getCuentas,
} from "../api";

import type {
  CuentaFinanciera,
} from "../types";

import CuentaFormModal
  from "./CuentaFormModal";

import CuentaDeleteModal
  from "./CuentaDeleteModal";

import FinanzasBackButton
  from "../FinanzasBackButton";


interface DolarBlue {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  moneda: string;
  fechaActualizacion: string;
}


function moneyARS(
  value:
    | string
    | number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value)
  );
}


function moneyUSD(
  value:
    | string
    | number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value)
  );
}


function moneyCuenta(
  value:
    | string
    | number,
  moneda: "ARS" | "USD"
) {
  if (
    moneda === "USD"
  ) {
    return moneyUSD(
      value
    );
  }

  return moneyARS(
    value
  );
}


export default function CuentasPage() {

  const navigate =
    useNavigate();


  const [
    cuentas,
    setCuentas,
  ] = useState<
    CuentaFinanciera[]
  >([]);


  const [
    dolar,
    setDolar,
  ] = useState<
    DolarBlue | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);


  const [
    editing,
    setEditing,
  ] = useState<
    CuentaFinanciera | null
  >(null);


  const [
    deleting,
    setDeleting,
  ] = useState<
    CuentaFinanciera | null
  >(null);


  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);


  async function loadDolar() {

    try {

      const response =
        await fetch(
          "https://dolarapi.com/v1/dolares/blue"
        );

      if (
        !response.ok
      ) {
        throw new Error(
          "No se pudo obtener la cotización."
        );
      }

      const data:
        DolarBlue =
          await response.json();

      setDolar(
        data
      );

    } catch (
      error
    ) {

      console.error(
        "Error obteniendo dólar:",
        error
      );

      setDolar(
        null
      );

    }
  }


  async function load() {

    try {

      setLoading(
        true
      );

      const [
        cuentasData,
      ] =
        await Promise.all([
          getCuentas(),
          loadDolar(),
        ]);

      setCuentas(
        cuentasData
      );

    } finally {

      setLoading(
        false
      );

    }
  }


  useEffect(
    () => {

      void load();

    },
    []
  );


  async function confirmDelete() {

    if (
      !deleting
    ) {
      return;
    }

    try {

      setDeleteLoading(
        true
      );

      await deleteCuenta(
        deleting.id
      );

      setDeleting(
        null
      );

      await load();

    } finally {

      setDeleteLoading(
        false
      );

    }
  }


  const totalARS =
    cuentas
      .filter(
        cuenta =>
          cuenta.moneda === "ARS"
      )
      .reduce(
        (
          acc,
          cuenta
        ) =>
          acc
          +
          Number(
            cuenta.saldo_actual
          ),
        0
      );


  const totalUSD =
    cuentas
      .filter(
        cuenta =>
          cuenta.moneda === "USD"
      )
      .reduce(
        (
          acc,
          cuenta
        ) =>
          acc
          +
          Number(
            cuenta.saldo_actual
          ),
        0
      );


  const totalUSDEnPesos =
    dolar
      ? (
          totalUSD
          *
          Number(
            dolar.venta
          )
        )
      : 0;


  const totalEquivalenteARS =
    totalARS
    +
    totalUSDEnPesos;


  return (
    <>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        <FinanzasBackButton />


        <header className="flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#89928C]">
              Finanzas
            </p>

            <h1 className="mt-1 text-3xl font-semibold">
              Cuentas
            </h1>

            <p className="mt-2 text-sm text-[#747D77]">
              Saldos actuales e historial.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setCreateOpen(
                true
              )
            }
            className="flex h-12 items-center gap-2 rounded-2xl bg-[#18392B] px-4 font-semibold text-white"
          >

            <Plus
              size={19}
            />

            <span className="hidden sm:inline">
              Nueva cuenta
            </span>

            <span className="sm:hidden">
              Nueva
            </span>

          </button>

        </header>


        {/* RESUMEN */}

        <div className="mt-6 rounded-[24px] bg-[#18392B] p-5 text-white sm:p-6">

          <div className="flex items-center gap-3">

            <WalletCards
              size={23}
            />

            <p className="text-sm font-medium text-white/70">
              Saldo total equivalente
            </p>

          </div>


          <p className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">

            {moneyARS(
              totalEquivalenteARS
            )}

          </p>


          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">
                Pesos
              </p>

              <p className="mt-1 text-xl font-semibold">

                {moneyARS(
                  totalARS
                )}

              </p>

            </div>


            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/55">
                Dólares
              </p>

              <p className="mt-1 text-xl font-semibold">

                {moneyUSD(
                  totalUSD
                )}

              </p>

              {dolar && (

                <p className="mt-1 text-xs text-white/60">
                  Equivale a{" "}
                  {moneyARS(
                    totalUSDEnPesos
                  )}
                </p>

              )}

            </div>

          </div>


          {dolar ? (

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-4 text-xs text-white/60">

              <span>
                Dólar blue venta:{" "}
                <strong className="font-semibold text-white/85">
                  {moneyARS(
                    dolar.venta
                  )}
                </strong>
              </span>

              <span>
                Cotización de referencia
              </span>

            </div>

          ) : (

            <p className="mt-4 border-t border-white/10 pt-4 text-xs text-amber-200">
              No se pudo obtener la cotización del dólar.
              El total equivalente no incluye las cuentas USD.
            </p>

          )}

        </div>


        {/* CUENTAS */}

        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {!loading &&
            cuentas.map(
              (
                cuenta
              ) => (

                <article
                  key={
                    cuenta.id
                  }
                  className="rounded-[24px] border border-[#E2E7E3] bg-white p-5 shadow-[0_4px_18px_rgba(20,30,24,0.04)]"
                >

                  <div className="flex items-start gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/finanzas/cuentas/${cuenta.id}`
                        )
                      }
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2ED] text-[#18392B]">

                        <Landmark
                          size={22}
                        />

                      </div>


                      <div className="min-w-0">

                        <h2 className="truncate text-lg font-semibold">
                          {cuenta.nombre}
                        </h2>


                        <p className="mt-1 text-xs text-[#89928C]">

                          {
                            cuenta.tipo_display
                          }

                          {" · "}

                          {
                            cuenta.moneda
                          }

                        </p>

                      </div>

                    </button>


                    <div className="flex">

                      <button
                        type="button"
                        onClick={() =>
                          setEditing(
                            cuenta
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[#68716B] transition hover:bg-[#F4F6F4]"
                      >

                        <Edit3
                          size={17}
                        />

                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          setDeleting(
                            cuenta
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition hover:bg-red-50"
                      >

                        <Trash2
                          size={17}
                        />

                      </button>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/finanzas/cuentas/${cuenta.id}`
                      )
                    }
                    className="mt-5 w-full rounded-2xl bg-[#F6F8F6] p-4 text-left"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <p className="text-xs font-semibold uppercase text-[#919A94]">
                        Saldo actual
                      </p>


                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          cuenta.moneda === "USD"
                            ? "bg-[#EAF1F8] text-[#39627D]"
                            : "bg-[#EAF2ED] text-[#315A45]"
                        }`}
                      >

                        {cuenta.moneda}

                      </span>

                    </div>


                    <p className="mt-1 text-2xl font-semibold text-[#1E2923]">

                      {moneyCuenta(
                        cuenta.saldo_actual,
                        cuenta.moneda
                      )}

                    </p>


                    {(
                      cuenta.moneda ===
                      "USD"
                      &&
                      dolar
                    ) && (

                      <p className="mt-1 text-xs font-medium text-[#89928C]">

                        ≈{" "}

                        {moneyARS(
                          Number(
                            cuenta.saldo_actual
                          )
                          *
                          Number(
                            dolar.venta
                          )
                        )}

                      </p>

                    )}

                  </button>


                  {!cuenta.activa && (

                    <p className="mt-3 text-xs font-semibold text-amber-700">
                      Cuenta inactiva
                    </p>

                  )}

                </article>

              )
            )}

        </div>

      </div>


      <CuentaFormModal
        open={
          createOpen
        }
        onClose={() =>
          setCreateOpen(
            false
          )
        }
        onSuccess={
          async () => {

            setCreateOpen(
              false
            );

            await load();

          }
        }
      />


      <CuentaFormModal
        open={
          editing !== null
        }
        cuenta={
          editing
        }
        onClose={() =>
          setEditing(
            null
          )
        }
        onSuccess={
          async () => {

            setEditing(
              null
            );

            await load();

          }
        }
      />


      <CuentaDeleteModal
        open={
          deleting !== null
        }
        cuenta={
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
          confirmDelete
        }
      />

    </>
  );
}