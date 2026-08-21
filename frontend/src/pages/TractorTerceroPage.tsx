import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  deleteTractorTercero,
  getProveedores,
  getTractorTerceros,
} from "../features/tractor/api";

import type {
  Proveedor,
  TractorTercero,
} from "../features/tractor/types";

import TractorCreateTerceroModal
  from "../features/tractor/TractorCreateTerceroModal";

import TractorEditTerceroModal
  from "../features/tractor/TractorEditTerceroModal";

import TractorDeleteModal
  from "../features/tractor/TractorDeleteModal";


function money(value: string | number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value));
}


function formatDate(fecha: string) {
  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      `${fecha}T12:00:00`
    )
  );
}


function initials(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (parte) => parte[0]
    )
    .join("")
    .toUpperCase();
}


export default function TractorTercerosPage() {

  const navigate = useNavigate();

  const [registros, setRegistros] =
    useState<TractorTercero[]>([]);

  const [proveedores, setProveedores] =
    useState<Proveedor[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<TractorTercero | null>(
      null
    );

  const [deleting, setDeleting] =
    useState<TractorTercero | null>(
      null
    );

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  const [menuOpen, setMenuOpen] =
    useState<number | null>(null);


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        trabajosData,
        proveedoresData,
      ] = await Promise.all([
        getTractorTerceros(),
        getProveedores(),
      ]);

      setRegistros(
        trabajosData
      );

      setProveedores(
        proveedoresData.filter(
          (p) => p.activo
        )
      );

    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron cargar los trabajos de terceros."
      );

    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  function showMessage(
    text: string
  ) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }


  async function refresh(
    text?: string
  ) {
    const data =
      await getTractorTerceros();

    setRegistros(data);

    if (text) {
      showMessage(text);
    }
  }


  async function handleDelete() {
    if (!deleting) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteTractorTercero(
        deleting.id
      );

      setDeleting(null);

      await refresh(
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


  const filtered =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return registros;
      }

      return registros.filter(
        (registro) =>
          registro.proveedor_nombre
            .toLowerCase()
            .includes(query) ||

          registro.observacion
            ?.toLowerCase()
            .includes(query)
      );

    }, [registros, search]);


  const pendientes =
    registros.filter(
      (item) =>
        item.estado ===
        "pendiente"
    );


  const horasPendientes =
    pendientes.reduce(
      (total, item) =>
        total +
        Number(
          item.cantidad_horas
        ),
      0
    );


  const importePendiente =
    pendientes.reduce(
      (total, item) =>
        total +
        Number(item.importe),
      0
    );


  return (
    <div className="mx-auto w-full max-w-3xl">

      {message && (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-xl bg-[#18392B] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {message}
        </div>
      )}


      <button
        type="button"
        onClick={() =>
          navigate("/tractor")
        }
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#68716B] hover:text-[#18392B]"
      >
        <ArrowLeft size={17} />
        Tractor
      </button>


      <header className="mb-7 flex items-end justify-between gap-4">

        <div>

          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7A837D]">
            Tractor
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#1B1E1C]">
            Terceros
          </h1>

          <p className="mt-2 text-sm text-[#6B746E]">
            Servicios realizados por proveedores externos.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            setCreateOpen(true)
          }
          className="flex h-12 shrink-0 items-center gap-2 rounded-2xl bg-[#18392B] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(24,57,43,0.18)] transition hover:-translate-y-0.5 hover:bg-[#204A38]"
        >
          <Plus size={19} />

          <span className="hidden sm:inline">
            Nueva carga
          </span>
        </button>

      </header>


      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">

        <div className="rounded-[22px] border border-[#E2E7E3] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#89928C]">
            Pendientes
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#18392B]">
            {pendientes.length}
          </p>

          <p className="mt-1 text-xs text-[#7A837D]">
            registros
          </p>
        </div>


        <div className="rounded-[22px] border border-[#E2E7E3] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#89928C]">
            Horas
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#18392B]">
            {horasPendientes}
          </p>

          <p className="mt-1 text-xs text-[#7A837D]">
            pendientes
          </p>
        </div>


        <div className="col-span-2 rounded-[22px] bg-[#18392B] p-4 text-white sm:col-span-1">

          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
            A pagar
          </p>

          <p className="mt-2 truncate text-xl font-semibold">
            {money(
              importePendiente
            )}
          </p>

          <p className="mt-1 text-xs text-white/60">
            importe pendiente
          </p>

        </div>

      </section>


      <div className="relative mb-5">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C958F]"
        />

        <input
          type="search"
          placeholder="Buscar proveedor u observación..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="h-12 w-full rounded-2xl border border-[#E0E5E1] bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#A0A7A2] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
        />

      </div>


      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {loading ? (

        <div className="rounded-[22px] border border-[#E2E7E3] bg-white p-12 text-center">
          <p className="text-sm text-[#7A837D]">
            Cargando trabajos...
          </p>
        </div>

      ) : filtered.length === 0 ? (

        <div className="rounded-[24px] border border-dashed border-[#D6DDD8] bg-white px-6 py-14 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2ED] text-[#18392B]">
            <Users size={26} />
          </div>

          <h2 className="mt-4 font-semibold text-[#1B1E1C]">
            No hay trabajos registrados
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#727B75]">
            Los servicios contratados a terceros aparecerán acá.
          </p>

        </div>

      ) : (

        <div className="space-y-3">

          {filtered.map(
            (registro) => {

              const pendiente =
                registro.estado ===
                "pendiente";

              return (
                <article
                  key={registro.id}
                  className="relative rounded-[22px] border border-[#E2E7E3] bg-white p-5 shadow-[0_3px_16px_rgba(20,30,24,0.04)] transition hover:border-[#CFD8D1] hover:shadow-[0_8px_24px_rgba(20,30,24,0.065)]"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2ED] text-sm font-bold text-[#18392B]">
                      {initials(
                        registro.proveedor_nombre
                      )}
                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="truncate font-semibold text-[#1B1E1C]">
                        {registro.proveedor_nombre}
                      </p>

                      <p className="mt-1 text-sm text-[#737C76]">
                        {formatDate(
                          registro.fecha
                        )}
                      </p>

                    </div>


                    {pendiente && (
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpen(
                            menuOpen ===
                              registro.id
                              ? null
                              : registro.id
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[#707A73] hover:bg-[#F3F5F3]"
                      >
                        <MoreVertical size={19} />
                      </button>
                    )}


                    {menuOpen ===
                      registro.id &&
                      pendiente && (

                      <div className="absolute right-4 top-14 z-30 w-48 overflow-hidden rounded-xl border border-[#E2E7E3] bg-white p-1 shadow-xl">

                        <button
                          type="button"
                          onClick={() => {
                            setEditing(
                              registro
                            );

                            setMenuOpen(
                              null
                            );
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#59615C] hover:bg-[#F5F7F5]"
                        >
                          <Pencil size={17} />
                          Editar
                        </button>


                        <button
                          type="button"
                          onClick={() => {
                            setDeleting(
                              registro
                            );

                            setMenuOpen(
                              null
                            );
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={17} />
                          Eliminar
                        </button>

                      </div>
                    )}

                  </div>


                  {registro.observacion && (
                    <p className="mt-4 text-sm leading-6 text-[#737C76]">
                      {registro.observacion}
                    </p>
                  )}


                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-[#F5F7F5] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#89928C]">
                        Horas
                      </p>

                      <p className="mt-1 text-xl font-semibold text-[#1B1E1C]">
                        {Number(
                          registro.cantidad_horas
                        )} h
                      </p>
                    </div>


                    <div className="rounded-2xl bg-[#F5F7F5] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#89928C]">
                        Importe
                      </p>

                      <p className="mt-1 truncate text-xl font-semibold text-[#18392B]">
                        {money(
                          registro.importe
                        )}
                      </p>
                    </div>

                  </div>


                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEF1EF] pt-4">

                    <span className="text-xs font-medium text-[#7A837D]">
                      {money(
                        registro.precio_hora
                      )}
                      {" / hora"}
                    </span>


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

                </article>
              );
            }
          )}

        </div>
      )}


      <TractorCreateTerceroModal
        open={createOpen}
        proveedores={proveedores}
        onClose={() =>
          setCreateOpen(false)
        }
        onSuccess={() =>
          refresh(
            "Trabajo registrado correctamente."
          )
        }
      />


      <TractorEditTerceroModal
        open={editing !== null}
        registro={editing}
        proveedores={proveedores}
        onClose={() =>
          setEditing(null)
        }
        onSuccess={() =>
          refresh(
            "Trabajo actualizado correctamente."
          )
        }
      />


      <TractorDeleteModal
        open={deleting !== null}
        title="Eliminar trabajo"
        description={
          deleting
            ? `Se eliminará el trabajo de ${deleting.proveedor_nombre}.`
            : ""
        }
        loading={deleteLoading}
        onCancel={() =>
          setDeleting(null)
        }
        onConfirm={handleDelete}
      />

    </div>
  );
}