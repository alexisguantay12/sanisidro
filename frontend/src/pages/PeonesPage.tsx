import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MoreVertical,
  Pencil,
  Plus,
  Search,
  UserRound,
  UserRoundX,
  Users,
} from "lucide-react";

import {
  deletePeon,
  getPeones,
} from "../features/peones/api";

import type { Peon } from "../features/peones/types";

import PeonModal from "../features/peones/PeonModal";
import ConfirmDeleteModal from "../features/peones/ConfirmDeleteModal";


export default function PeonesPage() {

  const [peones, setPeones] =
    useState<Peon[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingPeon, setEditingPeon] =
    useState<Peon | null>(null);

  const [menuOpen, setMenuOpen] =
    useState<number | null>(null);

  const [deletingPeon, setDeletingPeon] =
    useState<Peon | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");


  async function loadPeones() {
    try {
      setLoading(true);
      setError("");

      const data = await getPeones();

      setPeones(data);

    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron cargar los peones."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadPeones();
  }, []);


  const filteredPeones = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return peones;
    }

    return peones.filter((peon) =>
      peon.nombre
        .toLowerCase()
        .includes(query)
    );

  }, [peones, search]);


  function showMessage(text: string) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }


  function handleNewPeon() {
    setEditingPeon(null);
    setModalOpen(true);
  }


  function handleEdit(peon: Peon) {
    setEditingPeon(peon);
    setMenuOpen(null);
    setModalOpen(true);
  }


  function handleDeleteRequest(peon: Peon) {
    setMenuOpen(null);
    setDeletingPeon(peon);
  }


  async function handleDeleteConfirm() {

    if (!deletingPeon) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deletePeon(
        deletingPeon.id
      );

      setDeletingPeon(null);

      await loadPeones();

      showMessage(
        "Peón dado de baja correctamente."
      );

    } catch (error) {
      console.error(error);

      setError(
        "No se pudo dar de baja al peón."
      );

    } finally {
      setDeleteLoading(false);
    }
  }


  async function handleSaved() {
    await loadPeones();

    showMessage(
      editingPeon
        ? "Peón actualizado correctamente."
        : "Peón agregado correctamente."
    );
  }


  return (
    <div className="mx-auto w-full max-w-3xl">

      {message && (
        <div className="fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">
          {message}
        </div>
      )}


      <div className="mb-6 flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            Configuración
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Peones
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Administrá los trabajadores de la campaña.
          </p>
        </div>


        <button
          type="button"
          onClick={handleNewPeon}
          className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={20} />

          <span className="hidden sm:inline">
            Nuevo peón
          </span>
        </button>

      </div>


      <div className="relative mb-5">

        <Search
          size={19}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          placeholder="Buscar peón..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5"
        />

      </div>


      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}


      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

          <p className="text-sm text-slate-500">
            Cargando trabajadores...
          </p>

        </div>

      ) : filteredPeones.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Users size={26} />
          </div>

          <h2 className="mt-4 font-semibold text-slate-900">
            {search
              ? "No encontramos peones"
              : "Todavía no hay peones"}
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            {search
              ? "Probá buscando con otro nombre."
              : "Agregá el primer trabajador para comenzar a cargar tarjas."}
          </p>

          {!search && (
            <button
              type="button"
              onClick={handleNewPeon}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 font-medium text-white"
            >
              <Plus size={19} />
              Agregar peón
            </button>
          )}

        </div>

      ) : (

        <div className="space-y-3">

          {filteredPeones.map((peon) => (

              <div
                key={peon.id}
                className="
                  group relative flex items-center gap-4
                  rounded-[22px]
                  border border-[#E2E7E3]
                  bg-white
                  p-4
                  shadow-[0_2px_12px_rgba(20,30,24,0.035)]
                  transition-all duration-200
                  hover:-translate-y-[1px]
                  hover:border-[#CFD8D1]
                  hover:shadow-[0_8px_24px_rgba(20,30,24,0.07)]
                "
              >

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <UserRound size={23} />
              </div>


              <div className="min-w-0 flex-1">
                
                <p className="truncate font-semibold text-slate-900">
                  {peon.nombre}
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-xs font-medium text-slate-500">
                    Activo
                  </span>

                </div>

              </div>


              <button
                type="button"
                onClick={() =>
                  setMenuOpen(
                    menuOpen === peon.id
                      ? null
                      : peon.id
                  )
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              >
                <MoreVertical size={20} />
              </button>


              {menuOpen === peon.id && (

                <div className="absolute right-4 top-14 z-20 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl">

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(peon)
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={17} />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteRequest(peon)
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <UserRoundX size={17} />
                    Dar de baja
                  </button>

                </div>

              )}

            </div>

          ))}

        </div>

      )}


      <PeonModal
        open={modalOpen}
        peon={editingPeon}
        onClose={() =>
          setModalOpen(false)
        }
        onSuccess={handleSaved}
      />


      <ConfirmDeleteModal
        open={Boolean(deletingPeon)}
        nombre={deletingPeon?.nombre ?? ""}
        loading={deleteLoading}
        onCancel={() =>
          setDeletingPeon(null)
        }
        onConfirm={
          handleDeleteConfirm
        }
      />

    </div>
  );
}