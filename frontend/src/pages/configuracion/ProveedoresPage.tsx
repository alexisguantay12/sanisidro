import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Edit3,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import {
  deleteProveedor,
  getProveedores,
} from "../../features/configuracion/api";

import ProveedorModal
  from "../../features/configuracion/ProveedorModal";

import ConfigDeleteModal
  from "../../features/configuracion/ConfigDeleteModal";

import type {
  Proveedor,
} from "../../features/configuracion/types";

import {
  useNavigate,
} from "react-router-dom";

export default function ProveedoresPage() {
  const navigate =
    useNavigate();

  const [
    proveedores,
    setProveedores,
  ] = useState<Proveedor[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    selected,
    setSelected,
  ] = useState<Proveedor | null>(
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

      const data =
        await getProveedores();

      setProveedores(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filtered =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (!q) {
        return proveedores;
      }

      return proveedores.filter(
        (item) =>
          item.nombre
            .toLowerCase()
            .includes(q) ||
          item.observacion
            .toLowerCase()
            .includes(q)
      );
    }, [
      proveedores,
      search,
    ]);

  async function handleDelete() {
    if (!selected) {
      return;
    }

    try {
      setDeleting(true);

      await deleteProveedor(
        selected.id
      );

      setDeleteOpen(false);
      setSelected(null);

      await loadData();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="min-h-full bg-[#F6F8F6]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
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

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
                Configuración
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
                Proveedores
              </h1>

              <p className="mt-2 text-sm text-[#78817B]">
                Administrá los proveedores
                utilizados en los distintos
                módulos del sistema.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setModalOpen(true);
              }}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#18392B] px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38]"
            >
              <Plus size={18} />
              Nuevo proveedor
            </button>
          </div>

          <div className="mb-4 rounded-[24px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA29D]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Buscar proveedor..."
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] pl-11 pr-4 text-sm outline-none focus:border-[#9FB4A6] focus:bg-white focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-[24px] border border-[#E4E8E5] bg-white py-16 text-center">
              <p className="text-sm text-[#78817B]">
                Cargando proveedores...
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[24px] border border-[#E4E8E5] bg-white shadow-[0_8px_28px_rgba(27,30,28,0.04)] md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8ECE9] bg-[#FAFBFA]">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                        Proveedor
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                        Observación
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
                    {filtered.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#EEF1EF] last:border-0 hover:bg-[#FAFBFA]"
                        >
                          <td className="px-5 py-4 text-sm font-semibold text-[#242925]">
                            {item.nombre}
                          </td>

                          <td className="max-w-md px-5 py-4 text-sm text-[#727B75]">
                            {item.observacion ||
                              "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={
                                item.activo
                                  ? "rounded-full bg-[#EEF3EF] px-3 py-1 text-xs font-semibold text-[#466052]"
                                  : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                              }
                            >
                              {item.activo
                                ? "Activo"
                                : "Inactivo"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelected(
                                    item
                                  );
                                  setModalOpen(
                                    true
                                  );
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#657068] hover:bg-[#EEF3EF] hover:text-[#18392B]"
                              >
                                <Edit3 size={17} />
                              </button>

                              <button
                                onClick={() => {
                                  setSelected(
                                    item
                                  );
                                  setDeleteOpen(
                                    true
                                  );
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A938D] hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {filtered.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-[22px] border border-[#E4E8E5] bg-white p-4 shadow-[0_8px_24px_rgba(27,30,28,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Truck
                              size={17}
                              className="text-[#66806F]"
                            />

                            <p className="font-semibold text-[#242925]">
                              {item.nombre}
                            </p>
                          </div>

                          <span className="mt-2 inline-flex rounded-full bg-[#EEF3EF] px-2.5 py-1 text-xs font-semibold text-[#466052]">
                            {item.activo
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelected(
                                item
                              );
                              setModalOpen(
                                true
                              );
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F7F5] text-[#657068]"
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            onClick={() => {
                              setSelected(
                                item
                              );
                              setDeleteOpen(
                                true
                              );
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {item.observacion && (
                        <p className="mt-3 border-t border-[#EEF1EF] pt-3 text-sm leading-5 text-[#68716B]">
                          {item.observacion}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ProveedorModal
        open={modalOpen}
        proveedor={selected}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onSuccess={loadData}
      />

      <ConfigDeleteModal
        open={deleteOpen}
        title="Eliminar proveedor"
        description={
          selected
            ? `Vas a eliminar al proveedor ${selected.nombre}.`
            : ""
        }
        loading={deleting}
        onCancel={() => {
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