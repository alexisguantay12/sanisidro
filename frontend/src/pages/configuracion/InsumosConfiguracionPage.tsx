import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Edit3,
  FlaskConical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  deleteInsumo,
  getInsumosConfiguracion,
} from "../../features/configuracion/api";

import InsumoModal
  from "../../features/configuracion/InsumoModal";

import ConfigDeleteModal
  from "../../features/configuracion/ConfigDeleteModal";

import type {
  Insumo,
} from "../../features/configuracion/types";


export default function InsumosConfiguracionPage() {
  const navigate =
    useNavigate();

  const [
    insumos,
    setInsumos,
  ] = useState<Insumo[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    selected,
    setSelected,
  ] = useState<Insumo | null>(
    null
  );

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getInsumosConfiguracion();

      setInsumos(
        [...data].sort(
          (a, b) =>
            a.nombre.localeCompare(
              b.nombre,
              "es",
              {
                sensitivity: "base",
              }
            )
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron cargar los insumos."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    void loadData();
  }, []);


  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLocaleLowerCase("es");

      if (!query) {
        return insumos;
      }

      return insumos.filter(
        (item) =>
          item.nombre
            .toLocaleLowerCase("es")
            .includes(query) ||
          item.tipo_display
            .toLocaleLowerCase("es")
            .includes(query) ||
          item.observacion
            ?.toLocaleLowerCase("es")
            .includes(query)
      );
    }, [
      insumos,
      search,
    ]);


  function openCreate() {
    setSelected(null);
    setModalOpen(true);
  }


  function openEdit(
    item: Insumo
  ) {
    setSelected(item);
    setModalOpen(true);
  }


  function openDelete(
    item: Insumo
  ) {
    setSelected(item);
    setDeleteOpen(true);
  }


  async function handleDelete() {
    if (!selected) {
      return;
    }

    try {
      setDeleting(true);

      await deleteInsumo(
        selected.id
      );

      setDeleteOpen(false);
      setSelected(null);

      await loadData();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data
          ?.detail ??
          "No se pudo eliminar el insumo."
      );

      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  }


  return (
    <>
      <div className="min-h-full bg-[#F6F8F6]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

          {/* VOLVER */}
          <button
            type="button"
            onClick={() =>
              navigate(
                "/configuracion"
              )
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-[#667069] transition hover:text-[#18392B]"
          >
            <ArrowLeft size={17} />

            Configuración
          </button>


          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
                Configuración
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
                Insumos
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-[#78817B]">
                Administrá el catálogo de
                insumos disponibles para
                registrar aplicaciones y
                consumos.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#18392B] px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38]"
            >
              <Plus size={18} />

              Nuevo insumo
            </button>
          </div>


          {/* BUSCADOR */}
          <div className="mb-4 rounded-[24px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA29D]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Buscar por nombre, tipo u observación..."
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] pl-11 pr-4 text-sm text-[#333936] outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:bg-white focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>
          </div>


          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {/* LOADING */}
          {loading ? (
            <div className="rounded-[24px] border border-[#E4E8E5] bg-white px-6 py-16 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#E2E7E3] border-t-[#18392B]" />

              <p className="mt-4 text-sm text-[#78817B]">
                Cargando insumos...
              </p>
            </div>
          ) : filtered.length === 0 ? (

            /* VACÍO */
            <div className="rounded-[24px] border border-[#E4E8E5] bg-white px-6 py-14 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#537060]">
                <FlaskConical
                  size={22}
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#272C29]">
                {search
                  ? "No encontramos resultados"
                  : "No hay insumos cargados"}
              </h3>

              <p className="mt-1 text-sm text-[#808983]">
                {search
                  ? "Probá con otro criterio de búsqueda."
                  : "Creá el primer insumo para comenzar a utilizarlo en los consumos."}
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
                          Insumo
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Tipo
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Observación
                        </th>

                        <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Acciones
                        </th>

                      </tr>
                    </thead>


                    <tbody>
                      {filtered.map(
                        (item) => (
                          <tr
                            key={item.id}
                            className="border-b border-[#EEF1EF] last:border-b-0 hover:bg-[#FAFBFA]"
                          >

                            {/* NOMBRE */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF3EF] text-[#537060]">
                                  <FlaskConical
                                    size={17}
                                  />
                                </div>

                                <p className="text-sm font-semibold text-[#242925]">
                                  {item.nombre}
                                </p>
                              </div>
                            </td>


                            {/* TIPO */}
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-[#EEF3EF] px-3 py-1 text-xs font-semibold text-[#466052]">
                                {
                                  item.tipo_display
                                }
                              </span>
                            </td>


                            {/* OBSERVACION */}
                            <td className="max-w-md px-5 py-4">
                              <p
                                title={
                                  item.observacion
                                }
                                className="truncate text-sm text-[#727B75]"
                              >
                                {item.observacion ||
                                  "—"}
                              </p>
                            </td>


                            {/* ACCIONES */}
                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  title="Editar"
                                  onClick={() =>
                                    openEdit(
                                      item
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#657068] transition hover:bg-[#EEF3EF] hover:text-[#18392B]"
                                >
                                  <Edit3
                                    size={17}
                                  />
                                </button>

                                <button
                                  type="button"
                                  title="Eliminar"
                                  onClick={() =>
                                    openDelete(
                                      item
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A938D] transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2
                                    size={17}
                                  />
                                </button>

                              </div>
                            </td>

                          </tr>
                        )
                      )}
                    </tbody>

                  </table>
                </div>
              </div>


              {/* MOBILE */}
              <div className="space-y-3 md:hidden">

                {filtered.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-[22px] border border-[#E4E8E5] bg-white p-4 shadow-[0_8px_24px_rgba(27,30,28,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#537060]">
                              <FlaskConical
                                size={18}
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-base font-semibold text-[#242925]">
                                {item.nombre}
                              </p>

                              <span className="mt-1 inline-flex rounded-full bg-[#EEF3EF] px-2.5 py-1 text-xs font-semibold text-[#466052]">
                                {
                                  item.tipo_display
                                }
                              </span>

                            </div>
                          </div>

                        </div>


                        {/* ACCIONES MOBILE */}
                        <div className="flex shrink-0 gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                item
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F7F5] text-[#657068] transition active:scale-95"
                          >
                            <Edit3
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDelete(
                                item
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition active:scale-95"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>
                      </div>


                      {/* OBSERVACION */}
                      {item.observacion && (
                        <div className="mt-4 border-t border-[#EEF1EF] pt-3">

                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                            Observación
                          </p>

                          <p className="mt-1.5 text-sm leading-5 text-[#68716B]">
                            {
                              item.observacion
                            }
                          </p>

                        </div>
                      )}
                    </div>
                  )
                )}

              </div>


              {/* TOTAL */}
              <p className="mt-3 text-right text-xs text-[#929A95]">
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "insumo"
                  : "insumos"}
              </p>

            </>
          )}

        </div>
      </div>


      {/* CREATE / EDIT */}
      <InsumoModal
        open={modalOpen}
        insumo={selected}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSuccess={loadData}
      />


      {/* DELETE */}
      <ConfigDeleteModal
        open={deleteOpen}
        title="Eliminar insumo"
        description={
          selected
            ? `Vas a eliminar el insumo ${selected.nombre}.`
            : ""
        }
        loading={deleting}
        onCancel={() => {
          if (deleting) {
            return;
          }

          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={
          handleDelete
        }
      />
    </>
  );
}