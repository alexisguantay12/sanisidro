import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Edit3,
  Plus,
  Search,
  Sprout,
  Trash2,
} from "lucide-react";

import {
  deleteJornalCarpida,
  getJornalesCarpida,
} from "./api";

import type {
  JornalCarpida,
} from "./types";

import JornalCarpidaCreateModal
  from "./JornalCarpidaCreateModal";

import JornalCarpidaEditModal
  from "./JornalCarpidaEditModal";

import JornalCarpidaDeleteModal
  from "./JornalCarpidaDeleteModal";


function money(
  value: string | number
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


export default function JornalCarpidaPage() {

  const [
    jornales,
    setJornales,
  ] = useState<JornalCarpida[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editingJornal,
    setEditingJornal,
  ] = useState<JornalCarpida | null>(
    null
  );

  const [
    deletingJornal,
    setDeletingJornal,
  ] = useState<JornalCarpida | null>(
    null
  );

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);


  async function loadJornales() {

    try {

      setLoading(true);
      setError("");

      const data =
        await getJornalesCarpida();

      setJornales(data);

    } catch (error: any) {

      console.error(error);

      setError(
        error?.response?.data?.detail ??
        "No se pudieron cargar los jornales de carpida."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadJornales();
  }, []);


  function showMessage(
    text: string
  ) {

    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }


  async function handleCreateSuccess() {

    setCreateOpen(false);

    await loadJornales();

    showMessage(
      "Jornal de carpida registrado correctamente."
    );
  }


  async function handleEditSuccess() {

    setEditingJornal(null);

    await loadJornales();

    showMessage(
      "Registro actualizado correctamente."
    );
  }


  async function handleDeleteConfirm() {

    if (!deletingJornal) {
      return;
    }

    try {

      setDeleteLoading(true);
      setError("");

      await deleteJornalCarpida(
        deletingJornal.id
      );

      setDeletingJornal(null);

      await loadJornales();

      showMessage(
        "Registro eliminado correctamente."
      );

    } catch (error: any) {

      console.error(error);

      setError(
        error?.response?.data?.detail ??
        "No se pudo eliminar el registro."
      );

    } finally {

      setDeleteLoading(false);

    }
  }


  const filteredJornales =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return jornales;
      }

      return jornales.filter(
        (jornal) =>
          jornal.tipo_jornada_display
            .toLowerCase()
            .includes(query) ||

          formatDate(
            jornal.fecha
          )
            .toLowerCase()
            .includes(query) ||

          (
            jornal.observacion ??
            ""
          )
            .toLowerCase()
            .includes(query)
      );

    }, [
      jornales,
      search,
    ]);


  const pendientes =
    jornales.filter(
      (item) =>
        !item.liquidada
    );

    

  const totalPendiente =
    pendientes.reduce(
      (acc, item) =>
        acc +
        Number(
          item.importe
        ),
      0
    );


  const diasPendientes =
    pendientes.reduce(
      (acc, item) => {

        if (
          item.tipo_jornada ===
          "DIA"
        ) {
          return acc + 1;
        }

        return acc + 0.5;

      },
      0
    );


  return (
    <>

      {message && (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-xl bg-[#18392B] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {message}
        </div>
      )}


      <div className="min-h-full bg-[#F6F8F6]">

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">


          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
                Tarjas
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
                Jornales de carpida
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-[#78817B]">
                Registrá y administrá los trabajos
                realizados por día o medio día.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setCreateOpen(true)
              }
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#18392B] px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38]"
            >
              <Plus size={18} />

              Nueva carga
            </button>

          </div>


          {/* RESUMEN */}
          <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

            <div className="rounded-[24px] border border-[#E4E8E5] bg-white p-4 shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                Pendientes
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#18392B]">
                {pendientes.length}
              </p>

              <p className="mt-1 text-xs text-[#8B948E]">
                registros
              </p>

            </div>


            <div className="rounded-[24px] border border-[#E4E8E5] bg-white p-4 shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                Jornadas
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#18392B]">
                {diasPendientes}
              </p>

              <p className="mt-1 text-xs text-[#8B948E]">
                pendientes
              </p>

            </div>


            <div className="col-span-2 rounded-[24px] bg-[#18392B] p-4 text-white shadow-[0_8px_28px_rgba(24,57,43,0.14)] sm:col-span-1">

              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
                A pagar
              </p>

              <p className="mt-2 truncate text-xl font-semibold">
                {money(
                  totalPendiente
                )}
              </p>

              <p className="mt-1 text-xs text-white/60">
                importe pendiente
              </p>

            </div>

          </section>


          {/* BUSCADOR */}
          <div className="mb-4 rounded-[24px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA29D]"
              />

              <input
                type="search"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Buscar jornada, fecha u observación..."
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] pl-11 pr-4 text-sm text-[#333936] outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:bg-white focus:ring-4 focus:ring-[#18392B]/5"
              />

            </div>

          </div>


          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {loading ? (

            <div className="rounded-[24px] border border-[#E4E8E5] bg-white px-6 py-16 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#E2E7E3] border-t-[#18392B]" />

              <p className="mt-4 text-sm text-[#78817B]">
                Cargando jornales de carpida...
              </p>

            </div>

          ) : filteredJornales.length === 0 ? (

            <div className="rounded-[24px] border border-[#E4E8E5] bg-white px-6 py-14 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#537060]">
                <Sprout size={22} />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#272C29]">
                {search
                  ? "No encontramos registros"
                  : "No hay jornales de carpida"}
              </h3>

              <p className="mt-1 text-sm text-[#808983]">
                {search
                  ? "No encontramos registros con ese criterio."
                  : "Todavía no se registraron trabajos de carpida."}
              </p>

            </div>

          ) : (
            <>

              {/* DESKTOP */}
              <div className="hidden overflow-hidden rounded-[24px] border border-[#E4E8E5] bg-white shadow-[0_8px_28px_rgba(27,30,28,0.04)] md:block">

                <div className="overflow-x-auto">

                  <table className="w-full">

                    <thead>

                      <tr className="border-b border-[#E8ECE9] bg-[#FAFBFA]">

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Fecha
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Jornada
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Observación
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Valor jornal
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Importe
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Estado
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Acciones
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredJornales.map(
                        (jornal) => {

                          const pendiente =
                            !jornal.liquidada;

                          return (
                            <tr
                              key={jornal.id}
                              className="border-b border-[#EEF1EF] last:border-b-0 hover:bg-[#FAFBFA]"
                            >

                              <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#59615C]">
                                {formatDate(
                                  jornal.fecha
                                )}
                              </td>


                              <td className="px-5 py-4">

                                <span className="inline-flex rounded-full bg-[#EEF3EF] px-3 py-1 text-xs font-semibold text-[#466052]">
                                  {
                                    jornal.tipo_jornada_display
                                  }
                                </span>

                              </td>


                              <td className="max-w-[280px] px-5 py-4 text-sm text-[#727B75]">

                                <p className="truncate">
                                  {
                                    jornal.observacion ||
                                    "—"
                                  }
                                </p>

                              </td>


                              <td className="whitespace-nowrap px-5 py-4 text-sm text-[#727B75]">
                                {money(
                                  jornal.valor_jornal
                                )}
                              </td>


                              <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-[#18392B]">
                                {money(
                                  jornal.importe
                                )}
                              </td>


                              <td className="px-5 py-4">

                                {pendiente ? (

                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">

                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                                    Pendiente

                                  </span>

                                ) : (

                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">

                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                    Pagada

                                  </span>

                                )}

                              </td>


                              <td className="px-5 py-4">

                                {pendiente && (
                                  <div className="flex justify-end gap-2">

                                    <button
                                      type="button"
                                      title="Editar"
                                      onClick={() =>
                                        setEditingJornal(
                                          jornal
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#657068] transition hover:bg-[#EEF3EF] hover:text-[#18392B]"
                                    >
                                      <Edit3 size={17} />
                                    </button>

                                    <button
                                      type="button"
                                      title="Eliminar"
                                      onClick={() =>
                                        setDeletingJornal(
                                          jornal
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A938D] transition hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 size={17} />
                                    </button>

                                  </div>
                                )}

                              </td>

                            </tr>
                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              </div>


              {/* MOBILE */}
              <div className="space-y-3 md:hidden">

                {filteredJornales.map(
                  (jornal) => {

                    const pendiente =
                      !jornal.liquidada;

                    return (
                      <div
                        key={jornal.id}
                        className="rounded-[22px] border border-[#E4E8E5] bg-white p-4 shadow-[0_8px_24px_rgba(27,30,28,0.04)]"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0 flex-1">

                            <p className="text-base font-semibold text-[#242925]">
                              {
                                jornal.tipo_jornada_display
                              }
                            </p>

                            <p className="mt-1 text-xs font-medium text-[#8A938D]">
                              {formatDate(
                                jornal.fecha
                              )}
                            </p>

                          </div>


                          {pendiente && (
                            <div className="flex shrink-0 gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  setEditingJornal(
                                    jornal
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F7F5] text-[#657068] active:scale-95"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeletingJornal(
                                    jornal
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 active:scale-95"
                              >
                                <Trash2 size={16} />
                              </button>

                            </div>
                          )}

                        </div>


                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <div className="rounded-2xl bg-[#F6F8F6] p-3">

                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                              Valor jornal
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#444B47]">
                              {money(
                                jornal.valor_jornal
                              )}
                            </p>

                          </div>


                          <div className="rounded-2xl bg-[#F6F8F6] p-3">

                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                              Importe
                            </p>

                            <p className="mt-1 text-sm font-semibold text-[#18392B]">
                              {money(
                                jornal.importe
                              )}
                            </p>

                          </div>

                        </div>


                        {jornal.observacion && (
                          <div className="mt-3 rounded-2xl bg-[#FAFBFA] p-3">

                            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                              Observación
                            </p>

                            <p className="mt-1 text-sm leading-5 text-[#68716B]">
                              {
                                jornal.observacion
                              }
                            </p>

                          </div>
                        )}


                        <div className="mt-3 flex items-center justify-end border-t border-[#EEF1EF] pt-3">

                          {pendiente ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                              Pendiente

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                              Pagada

                            </span>

                          )}

                        </div>

                      </div>
                    );

                  }
                )}

              </div>

            </>
          )}

        </div>

      </div>


      <JornalCarpidaCreateModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onSuccess={
          handleCreateSuccess
        }
      />


      <JornalCarpidaEditModal
        open={
          editingJornal !== null
        }
        jornal={
          editingJornal
        }
        onClose={() =>
          setEditingJornal(null)
        }
        onSuccess={
          handleEditSuccess
        }
      />


      <JornalCarpidaDeleteModal
        open={
          deletingJornal !== null
        }
        jornal={
          deletingJornal
        }
        loading={
          deleteLoading
        }
        onCancel={() =>
          setDeletingJornal(null)
        }
        onConfirm={
          handleDeleteConfirm
        }
      />

    </>
  );
}