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

import FinanzasBackButton from "../FinanzasBackButton";

function money(
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


export default function CuentasPage() {

  const navigate =
    useNavigate();

  const [
    cuentas,
    setCuentas,
  ] =
    useState<
      CuentaFinanciera[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<
      CuentaFinanciera | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState<
      CuentaFinanciera | null
    >(null);

  const [
    deleteLoading,
    setDeleteLoading,
  ] =
    useState(false);


  async function load() {

    try {

      setLoading(true);

      const data =
        await getCuentas();

      setCuentas(data);

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    load();
  }, []);


  async function confirmDelete() {

    if (!deleting) {
      return;
    }

    try {

      setDeleteLoading(true);

      await deleteCuenta(
        deleting.id
      );

      setDeleting(null);

      await load();

    } finally {

      setDeleteLoading(false);

    }
  }


  const total =
    cuentas.reduce(
      (
        acc,
        cuenta
      ) =>
        acc +
        Number(
          cuenta.saldo_actual
        ),
      0
    );


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
              setCreateOpen(true)
            }
            className="flex h-12 items-center gap-2 rounded-2xl bg-[#18392B] px-4 font-semibold text-white"
          >
            <Plus size={19} />

            <span className="hidden sm:inline">
              Nueva cuenta
            </span>

            <span className="sm:hidden">
              Nueva
            </span>
          </button>

        </header>


        <div className="mt-6 rounded-[24px] bg-[#18392B] p-5 text-white sm:p-6">

          <div className="flex items-center gap-3">

            <WalletCards
              size={23}
            />

            <p className="text-sm font-medium text-white/70">
              Saldo total de cuentas
            </p>

          </div>

          <p className="mt-3 text-3xl font-semibold tracking-tight">
            {money(total)}
          </p>

        </div>


        <div className="mt-5 grid gap-4 md:grid-cols-2">

          {!loading &&
            cuentas.map(
              (cuenta) => (

                <article
                  key={cuenta.id}
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[#68716B]"
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500"
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

                    <p className="text-xs font-semibold uppercase text-[#919A94]">
                      Saldo actual
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-[#1E2923]">
                      {money(
                        cuenta.saldo_actual
                      )}
                    </p>

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
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onSuccess={async () => {
          setCreateOpen(false);
          await load();
        }}
      />


      <CuentaFormModal
        open={editing !== null}
        cuenta={editing}
        onClose={() =>
          setEditing(null)
        }
        onSuccess={async () => {
          setEditing(null);
          await load();
        }}
      />


      <CuentaDeleteModal
        open={deleting !== null}
        cuenta={deleting}
        loading={
          deleteLoading
        }
        onCancel={() =>
          setDeleting(null)
        }
        onConfirm={
          confirmDelete
        }
      />

    </>
  );
}