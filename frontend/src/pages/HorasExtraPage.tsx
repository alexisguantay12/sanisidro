import { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { getPeones } from "../features/peones/api";
import type { Peon } from "../features/peones/types";

import {
  deleteHoraExtra,
  getHorasExtra,
} from "../features/horasExtra/api";

import type { HoraExtra } from "../features/horasExtra/types";

import HoraExtraCreateModal from "../features/horasExtra/HoraExtraCreateModal";
import HoraExtraEditModal from "../features/horasExtra/HoraExtraEditModal";
import HoraExtraDeleteModal from "../features/horasExtra/HoraExtraDeleteModal";


function money(value: string | number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(value));
}


function formatDate(fecha: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(
    new Date(`${fecha}T12:00:00`)
  );
}


function getInitials(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}


export default function HorasExtraPage() {
  const [horasExtra, setHorasExtra] =
    useState<HoraExtra[]>([]);

  const [peones, setPeones] =
    useState<Peon[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editingHora, setEditingHora] =
    useState<HoraExtra | null>(null);

  const [deletingHora, setDeletingHora] =
    useState<HoraExtra | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");


  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        horasData,
        peonesData,
      ] = await Promise.all([
        getHorasExtra(),
        getPeones(),
      ]);

      setHorasExtra(horasData);
      setPeones(peonesData);

    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron cargar las horas extra."
      );

    } finally {
      setLoading(false);
    }
  }


  async function loadHorasExtra() {
    try {
      const data =
        await getHorasExtra();

      setHorasExtra(data);

    } catch (error) {
      console.error(error);

      setError(
        "No se pudieron actualizar las horas extra."
      );
    }
  }


  useEffect(() => {
    loadData();
  }, []);


  function showMessage(text: string) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }


  async function handleCreateSuccess() {
    await loadHorasExtra();

    showMessage(
      "Hora extra registrada correctamente."
    );
  }


  async function handleEditSuccess() {
    await loadHorasExtra();

    showMessage(
      "Horas actualizadas correctamente."
    );
  }


  async function handleDeleteConfirm() {
    if (!deletingHora) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteHoraExtra(
        deletingHora.id
      );

      setDeletingHora(null);

      await loadHorasExtra();

      showMessage(
        "Registro eliminado correctamente."
      );

    } catch (error: any) {
      console.error(error);

      const detail =
        error?.response?.data?.detail;

      setError(
        detail ??
        "No se pudo eliminar el registro."
      );

    } finally {
      setDeleteLoading(false);
    }
  }


  const filteredHoras =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return horasExtra;
      }

      return horasExtra.filter(
        (hora) =>
          hora.peon_nombre
            .toLowerCase()
            .includes(query) ||
          hora.motivo_display
            .toLowerCase()
            .includes(query)
      );
    }, [horasExtra, search]);


  const pendientes =
    horasExtra.filter(
      (item) =>
        item.estado === "pendiente"
    );


  const totalPendiente =
    pendientes.reduce(
      (acc, item) =>
        acc + Number(item.total),
      0
    );


  return (
    <div className="mx-auto w-full max-w-3xl">

      {message && (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-xl bg-[#18392B] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {message}
        </div>
      )}


      <header className="mb-7 flex items-end justify-between gap-4">

        <div>

          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7A837D]">
            Personal
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#1B1E1C]">
            Horas extra
          </h1>

          <p className="mt-2 text-sm text-[#6B746E]">
            Registrá y administrá horas trabajadas fuera de jornada.
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


      <section className="mb-6 grid grid-cols-2 gap-3">

        <div className="rounded-[22px] border border-[#E2E7E3] bg-white p-4 shadow-[0_3px_16px_rgba(20,30,24,0.035)]">

          <p className="text-xs font-semibold uppercase tracking-wide text-[#89928C]">
            Pendientes
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#18392B]">
            {pendientes.length}
          </p>

          <p className="mt-1 text-xs text-[#7A837D]">
            registros
          </p>

        </div>


        <div className="rounded-[22px] bg-[#18392B] p-4 text-white shadow-[0_8px_24px_rgba(24,57,43,0.15)]">

          <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
            A pagar
          </p>

          <p className="mt-2 truncate text-xl font-semibold tracking-tight">
            {money(totalPendiente)}
          </p>

          <p className="mt-1 text-xs text-white/60">
            horas pendientes
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
          placeholder="Buscar peón o motivo..."
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
            Cargando horas extra...
          </p>

        </div>

      ) : filteredHoras.length === 0 ? (

        <div className="rounded-[24px] border border-dashed border-[#D6DDD8] bg-white px-6 py-14 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2ED] text-[#18392B]">
            <Clock3 size={26} />
          </div>

          <h2 className="mt-4 font-semibold text-[#1B1E1C]">
            {search
              ? "No encontramos registros"
              : "Todavía no hay horas extra"}
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#727B75]">
            {search
              ? "Probá con otro trabajador o motivo."
              : "Cuando cargues horas extra aparecerán acá."}
          </p>


          {!search && (
            <button
              type="button"
              onClick={() =>
                setCreateOpen(true)
              }
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#18392B] px-4 text-sm font-semibold text-white"
            >
              <Plus size={18} />
              Nueva carga
            </button>
          )}

        </div>

      ) : (

        <div className="space-y-3">

          {filteredHoras.map(
            (hora) => {

              const pendiente =
                hora.estado ===
                "pendiente";

              return (
                <article
                  key={hora.id}
                  className="relative rounded-[22px] border border-[#E2E7E3] bg-white p-5 shadow-[0_3px_16px_rgba(20,30,24,0.04)] transition hover:border-[#CFD8D1] hover:shadow-[0_8px_24px_rgba(20,30,24,0.065)]"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2ED] text-sm font-bold text-[#18392B]">
                      {getInitials(
                        hora.peon_nombre
                      )}
                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="truncate font-semibold text-[#1B1E1C]">
                        {hora.peon_nombre}
                      </p>

                      <p className="mt-1 text-sm text-[#737C76]">
                        {formatDate(
                          hora.fecha
                        )}
                        {" · "}
                        {
                          hora.motivo_display
                        }
                      </p>

                    </div>


                    {pendiente && (
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpen(
                            menuOpen ===
                              hora.id
                              ? null
                              : hora.id
                          )
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#707A73] transition hover:bg-[#F3F5F3]"
                      >
                        <MoreVertical
                          size={19}
                        />
                      </button>
                    )}


                    {menuOpen ===
                      hora.id &&
                      pendiente && (

                      <div className="absolute right-4 top-14 z-30 w-48 overflow-hidden rounded-xl border border-[#E2E7E3] bg-white p-1 shadow-xl">

                        <button
                          type="button"
                          onClick={() => {
                            setEditingHora(
                              hora
                            );

                            setMenuOpen(
                              null
                            );
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#59615C] transition hover:bg-[#F5F7F5]"
                        >
                          <Pencil
                            size={17}
                          />

                          Editar horas
                        </button>


                        <button
                          type="button"
                          onClick={() => {
                            setDeletingHora(
                              hora
                            );

                            setMenuOpen(
                              null
                            );
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2
                            size={17}
                          />

                          Eliminar
                        </button>

                      </div>

                    )}

                  </div>


                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-[#F5F7F5] p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-[#89928C]">
                        Horas
                      </p>

                      <p className="mt-1 text-xl font-semibold text-[#1B1E1C]">
                        {
                          hora.cantidad_horas
                        } h
                      </p>

                    </div>


                    <div className="rounded-2xl bg-[#F5F7F5] p-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-[#89928C]">
                        Total
                      </p>

                      <p className="mt-1 text-xl font-semibold text-[#18392B]">
                        {money(
                          hora.total
                        )}
                      </p>

                    </div>

                  </div>


                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#EEF1EF] pt-4">

                    <span className="text-xs font-medium text-[#7A837D]">
                      {money(
                        hora.valor_hora
                      )}
                      {" / hora"}
                    </span>


                    {pendiente ? (

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                        Pendiente de pago
                      </span>

                    ) : (

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                        Liquidada
                      </span>

                    )}

                  </div>

                </article>
              );
            }
          )}

        </div>

      )}


      <HoraExtraCreateModal
        open={createOpen}
        peones={peones}
        onClose={() =>
          setCreateOpen(false)
        }
        onSuccess={
          handleCreateSuccess
        }
      />


      <HoraExtraEditModal
        open={editingHora !== null}
        horaExtra={editingHora}
        onClose={() =>
          setEditingHora(null)
        }
        onSuccess={
          handleEditSuccess
        }
      />


      <HoraExtraDeleteModal
        open={deletingHora !== null}
        horaExtra={deletingHora}
        loading={deleteLoading}
        onCancel={() =>
          setDeletingHora(null)
        }
        onConfirm={
          handleDeleteConfirm
        }
      />

    </div>
  );
}