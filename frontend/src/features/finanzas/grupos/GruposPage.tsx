import {
  useEffect,
  useState,
} from "react";

import {
  Edit3,
  FolderTree,
  Plus,
  Trash2,
} from "lucide-react";

import {
  deleteGrupo,
  getGrupos,
} from "../api";

import type {
  GrupoFinanciero,
} from "../types";

import GrupoFormModal
  from "./GrupoFormModal";

import GrupoDeleteModal
  from "./GrupoDeleteModal";

import FinanzasBackButton from "../FinanzasBackButton";

export default function GruposPage() {

  const [
    grupos,
    setGrupos,
  ] =
    useState<
      GrupoFinanciero[]
    >([]);

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
      GrupoFinanciero | null
    >(null);

  const [
    deleting,
    setDeleting,
  ] =
    useState<
      GrupoFinanciero | null
    >(null);

  const [
    deleteLoading,
    setDeleteLoading,
  ] =
    useState(false);


  async function load() {

    const data =
      await getGrupos();

    setGrupos(data);
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

      await deleteGrupo(
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
              Grupos
            </h1>

            <p className="mt-2 text-sm text-[#747D77]">
              Agrupación principal de categorías.
            </p>

          </div>

          <button
            onClick={() =>
              setCreateOpen(true)
            }
            className="flex h-12 items-center gap-2 rounded-2xl bg-[#18392B] px-4 font-semibold text-white"
          >
            <Plus size={19} />
            Nuevo
          </button>

        </header>


        <div className="mt-6 space-y-3">

          {grupos.map(
            (grupo) => (

              <div
                key={grupo.id}
                className="flex items-center gap-4 rounded-[22px] border border-[#E2E7E3] bg-white p-4 sm:p-5"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F5EFE9] text-[#745942]">
                  <FolderTree
                    size={20}
                  />
                </div>


                <div className="min-w-0 flex-1">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="font-semibold">
                      {grupo.nombre}
                    </h2>

                    <span className="rounded-full bg-[#F3F5F3] px-2.5 py-1 text-[11px] font-semibold text-[#6F7872]">
                      {
                        grupo.tipo_display
                      }
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-[#89928C]">
                    {
                      grupo.cantidad_categorias
                    }{" "}
                    categorías
                  </p>

                </div>


                <button
                  onClick={() =>
                    setEditing(
                      grupo
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                >
                  <Edit3 size={17} />
                </button>

                <button
                  onClick={() =>
                    setDeleting(
                      grupo
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500"
                >
                  <Trash2 size={17} />
                </button>

              </div>

            )
          )}

        </div>

      </div>


      <GrupoFormModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onSuccess={async () => {
          setCreateOpen(false);
          await load();
        }}
      />


      <GrupoFormModal
        open={editing !== null}
        grupo={editing}
        onClose={() =>
          setEditing(null)
        }
        onSuccess={async () => {
          setEditing(null);
          await load();
        }}
      />


      <GrupoDeleteModal
        open={deleting !== null}
        grupo={deleting}
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