import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Edit3,
  Plus,
  Search,
  Tags,
  Trash2,
} from "lucide-react";

import {
  deleteCategoria,
  getCategorias,
} from "../api";

import type {
  CategoriaFinanciera,
} from "../types";

import CategoriaFormModal
  from "./CategoriaFormModal";

import CategoriaDeleteModal
  from "./CategoriaDeleteModal";
import FinanzasBackButton from "../FinanzasBackButton";


export default function CategoriasPage() {

  const [
    categorias,
    setCategorias,
  ] =
    useState<
      CategoriaFinanciera[]
    >([]);

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
    editing,
    setEditing,
  ] =
    useState<
      CategoriaFinanciera | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState<
      CategoriaFinanciera | null
    >(null);

  const [
    deleteLoading,
    setDeleteLoading,
  ] =
    useState(false);


  async function load() {

    const data =
      await getCategorias();

    setCategorias(data);
  }


  useEffect(() => {
    load();
  }, []);


  const filtered =
    useMemo(() => {

      const q =
        search
          .trim()
          .toLowerCase();

      if (!q) {
        return categorias;
      }

      return categorias.filter(
        (item) =>
          item.nombre
            .toLowerCase()
            .includes(q) ||
          item.grupo_nombre
            .toLowerCase()
            .includes(q)
      );

    }, [
      categorias,
      search,
    ]);


  async function confirmDelete() {

    if (!deleting) {
      return;
    }

    try {

      setDeleteLoading(true);

      await deleteCategoria(
        deleting.id
      );

      setDeleting(null);

      await load();

    } finally {

      setDeleteLoading(false);

    }
  }


  return (
    <>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <FinanzasBackButton />
        <header className="flex items-end justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#89928C]">
              Finanzas
            </p>

            <h1 className="mt-1 text-3xl font-semibold">
              Categorías
            </h1>
          </div>

          <button
            onClick={() =>
              setCreateOpen(true)
            }
            className="flex h-12 items-center gap-2 rounded-2xl bg-[#18392B] px-4 font-semibold text-white"
          >
            <Plus size={19} />
            Nueva
          </button>

        </header>


        <div className="relative mt-6">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#909893]"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white pl-11 pr-4 outline-none"
            placeholder="Buscar categoría..."
          />

        </div>


        <div className="mt-4 space-y-3">

          {filtered.map(
            (item) => (

              <div
                key={item.id}
                className="flex items-center gap-4 rounded-[22px] border border-[#E2E7E3] bg-white p-4"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F1EDF4] text-[#685371]">
                  <Tags size={19} />
                </div>


                <div className="min-w-0 flex-1">

                  <h2 className="font-semibold">
                    {item.nombre}
                  </h2>

                  <p className="mt-1 text-xs text-[#89928C]">
                    {
                      item.grupo_nombre
                    }
                    {" · "}
                    {
                      item.cantidad_movimientos
                    }{" "}
                    movimientos
                  </p>

                </div>


                <button
                  onClick={() =>
                    setEditing(item)
                  }
                  className="flex h-10 w-10 items-center justify-center"
                >
                  <Edit3 size={17} />
                </button>

                <button
                  onClick={() =>
                    setDeleting(item)
                  }
                  className="flex h-10 w-10 items-center justify-center text-red-500"
                >
                  <Trash2 size={17} />
                </button>

              </div>

            )
          )}

        </div>

      </div>


      <CategoriaFormModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onSuccess={async () => {
          setCreateOpen(false);
          await load();
        }}
      />


      <CategoriaFormModal
        open={editing !== null}
        categoria={editing}
        onClose={() =>
          setEditing(null)
        }
        onSuccess={async () => {
          setEditing(null);
          await load();
        }}
      />


      <CategoriaDeleteModal
        open={deleting !== null}
        categoria={deleting}
        loading={deleteLoading}
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