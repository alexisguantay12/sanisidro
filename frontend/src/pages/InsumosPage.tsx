import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteConsumoInsumo,
  getConsumosInsumos,
  getInsumos,
} from "../features/insumos/api";

import InsumoCreateModal
  from "../features/insumos/InsumoCreateModal";

import InsumoEditModal
  from "../features/insumos/InsumoEditModal";

import InsumoDeleteModal
  from "../features/insumos/InsumoDeleteModal";

import type {
  ConsumoInsumo,
  Insumo,
} from "../features/insumos/types";

function formatDate(
  value: string
) {
  if (!value) {
    return "-";
  }

  const [
    year,
    month,
    day,
  ] = value.split("-");

  return `${day}/${month}/${year}`;
}

export default function InsumosPage() {
  const [
    consumos,
    setConsumos,
  ] = useState<
    ConsumoInsumo[]
  >([]);

  const [
    insumos,
    setInsumos,
  ] = useState<Insumo[]>(
    []
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
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
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    selected,
    setSelected,
  ] = useState<
    ConsumoInsumo | null
  >(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        consumosData,
        insumosData,
      ] = await Promise.all([
        getConsumosInsumos(),
        getInsumos(),
      ]);

      setConsumos(
        consumosData
      );

      setInsumos(
        [...insumosData].sort(
          (a, b) =>
            a.nombre.localeCompare(
              b.nombre,
              "es",
              {
                sensitivity:
                  "base",
              }
            )
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron cargar los consumos."
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
          .toLowerCase();

      if (!query) {
        return consumos;
      }

      return consumos.filter(
        (item) =>
          item.insumo_nombre
            .toLowerCase()
            .includes(query) ||
          item.insumo_tipo_display
            .toLowerCase()
            .includes(query) ||
          item.observacion
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      consumos,
      search,
    ]);

  function openEdit(
    item: ConsumoInsumo
  ) {
    setSelected(item);
    setEditOpen(true);
  }

  function openDelete(
    item: ConsumoInsumo
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

      await deleteConsumoInsumo(
        selected.id
      );

      setDeleteOpen(false);
      setSelected(null);

      await loadData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="min-h-full bg-[#F6F8F6]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
                Producción
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
                Insumos
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-[#78817B]">
                Registro de insumos
                utilizados en las
                aplicaciones del campo.
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

              Nuevo consumo
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
                placeholder="Buscar insumo..."
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
                Cargando consumos...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[24px] border border-[#E4E8E5] bg-white px-6 py-14 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#537060]">
                <Package size={22} />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#272C29]">
                No hay consumos
              </h3>

              <p className="mt-1 text-sm text-[#808983]">
                {search
                  ? "No encontramos registros con ese criterio."
                  : "Todavía no se registraron consumos de insumos."}
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
                          Insumo
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Tipo
                        </th>

                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                          Cantidad
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
                            <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-[#59615C]">
                              {formatDate(
                                item.fecha_aplicacion
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <p className="text-sm font-semibold text-[#242925]">
                                {
                                  item.insumo_nombre
                                }
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-[#EEF3EF] px-3 py-1 text-xs font-semibold text-[#466052]">
                                {
                                  item.insumo_tipo_display
                                }
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <p className="text-sm font-semibold text-[#333936]">
                                {
                                  item.cantidad
                                }{" "}
                                {
                                  item.unidad_display
                                }
                              </p>
                            </td>

                            <td className="max-w-[320px] px-5 py-4">
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

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEdit(
                                      item
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#657068] transition hover:bg-[#EEF3EF] hover:text-[#18392B]"
                                >
                                  <Edit3
                                    size={
                                      17
                                    }
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openDelete(
                                      item
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A938D] transition hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2
                                    size={
                                      17
                                    }
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
                          <p className="truncate text-base font-semibold text-[#242925]">
                            {
                              item.insumo_nombre
                            }
                          </p>

                          <p className="mt-1 text-xs font-medium text-[#8A938D]">
                            {
                              item.insumo_tipo_display
                            }
                          </p>
                        </div>

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
                              size={
                                16
                              }
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
                              size={
                                16
                              }
                            />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[#F6F8F6] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                            Fecha
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#444B47]">
                            {formatDate(
                              item.fecha_aplicacion
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#F6F8F6] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                            Cantidad
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#444B47]">
                            {
                              item.cantidad
                            }{" "}
                            {
                              item.unidad_display
                            }
                          </p>
                        </div>
                      </div>

                      {item.observacion && (
                        <div className="mt-3 border-t border-[#EEF1EF] pt-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#929A95]">
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
            </>
          )}
        </div>
      </div>

      <InsumoCreateModal
        open={createOpen}
        insumos={insumos}
        onClose={() =>
          setCreateOpen(false)
        }
        onSuccess={loadData}
      />

      <InsumoEditModal
        open={editOpen}
        consumo={selected}
        insumos={insumos}
        onClose={() => {
          setEditOpen(false);
          setSelected(null);
        }}
        onSuccess={loadData}
      />

      <InsumoDeleteModal
        open={deleteOpen}
        loading={deleting}
        description={
          selected
            ? `Vas a eliminar el consumo de ${selected.insumo_nombre} por ${selected.cantidad} ${selected.unidad_display}.`
            : ""
        }
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