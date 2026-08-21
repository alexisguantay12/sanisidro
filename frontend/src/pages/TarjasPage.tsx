import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";

import {
  getTarjasMes,
  saveTarjasMes,
} from "../features/tarjas/api";

import TarjaCalendar from "../features/tarjas/TarjaCalendar";
import DayModal from "../features/tarjas/DayModal";

import { getPeones } from "../features/peones/api";

import type { Peon } from "../features/peones/types";

import type {
  TarjaLocal,
} from "../features/tarjas/types";


const monthFormatter =
  new Intl.DateTimeFormat(
    "es-AR",
    {
      month: "long",
      year: "numeric",
    }
  );


export default function TarjasPage() {

  const today = new Date();

  const [year, setYear] =
    useState(today.getFullYear());

  const [month, setMonth] =
    useState(today.getMonth());

  const [peones, setPeones] =
    useState<Peon[]>([]);

  const [peonId, setPeonId] =
    useState<number | null>(null);

  const [registros, setRegistros] =
    useState<
      Record<string, TarjaLocal>
    >({});

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");


  useEffect(() => {

    getPeones().then(setPeones);

  }, []);


  useEffect(() => {

    if (!peonId) {
      setRegistros({});
      return;
    }

    loadMonth();

  }, [peonId, year, month]);


  async function loadMonth() {

    if (!peonId) {
      return;
    }

    try {

      setLoading(true);

      const data =
        await getTarjasMes(
          peonId,
          year,
          month + 1
        );

      const map:
        Record<string, TarjaLocal> = {};

      data.forEach((tarja) => {

        map[tarja.fecha] = {
          fecha: tarja.fecha,
          fraccion: tarja.fraccion,
          tarea: tarja.tarea,
          observacion:
            tarja.observacion,
          modified: false,
        };

      });

      setRegistros(map);

    } finally {

      setLoading(false);

    }
  }


  const modifiedRecords =
    useMemo(
      () =>
        Object.values(
          registros
        ).filter(
          (item) => item.modified
        ),
      [registros]
    );


  function handleDaySave(
    registro: TarjaLocal
  ) {

    setRegistros(
      (current) => ({
        ...current,
        [registro.fecha]:
          registro,
      })
    );
  }


  function previousMonth() {

    if (month === 0) {
      setMonth(11);
      setYear((value) =>
        value - 1
      );
    } else {
      setMonth((value) =>
        value - 1
      );
    }
  }


  function nextMonth() {

    if (month === 11) {
      setMonth(0);
      setYear((value) =>
        value + 1
      );
    } else {
      setMonth((value) =>
        value + 1
      );
    }
  }


  async function handleSave() {

    if (
      !peonId ||
      modifiedRecords.length === 0
    ) {
      return;
    }

    try {

      setSaving(true);

      await saveTarjasMes({
        peon: peonId,
        registros:
          modifiedRecords,
      });

      await loadMonth();

      setMessage(
        "Tarjas guardadas correctamente."
      );

      window.setTimeout(
        () => setMessage(""),
        2500
      );

    } finally {

      setSaving(false);

    }
  }


  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {message && (
        <div className="fixed left-1/2 top-5 z-[60] -translate-x-1/2 rounded-xl bg-[#18392B] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {message}
        </div>
      )}


      <header>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A837D]">
          Personal
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#1B1E1C]">
          Tarjas
        </h1>

        <p className="mt-2 text-sm text-[#6B746E]">
          Registrá los días trabajados de cada peón.
        </p>

      </header>


      <section className="rounded-[22px] border border-[#E2E7E3] bg-white p-4">

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#7A837D]">
          Peón
        </label>

        <select
          value={peonId ?? ""}
          onChange={(e) =>
            setPeonId(
              e.target.value
                ? Number(
                    e.target.value
                  )
                : null
            )
          }
          className="h-13 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 font-medium text-[#303632] outline-none focus:border-[#18392B]"
        >

          <option value="">
            Seleccionar trabajador
          </option>

          {peones.map((peon) => (
            <option
              key={peon.id}
              value={peon.id}
            >
              {peon.nombre}
            </option>
          ))}

        </select>

      </section>


      {peonId && (
        <>

          <section className="flex items-center justify-between">

            <button
              onClick={previousMonth}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E0E5E1] bg-white text-[#505752] shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>


            <h2 className="capitalize text-lg font-semibold text-[#252A27]">
              {monthFormatter.format(
                new Date(
                  year,
                  month,
                  1
                )
              )}
            </h2>


            <button
              onClick={nextMonth}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E0E5E1] bg-white text-[#505752] shadow-sm"
            >
              <ChevronRight size={20} />
            </button>

          </section>


          {loading ? (

            <div className="py-16 text-center text-sm text-[#7A837D]">
              Cargando tarjas...
            </div>

          ) : (

            <TarjaCalendar
              year={year}
              month={month}
              registros={registros}
              onDayClick={
                setSelectedDate
              }
            />

          )}


          <div className="flex items-center gap-4 rounded-2xl bg-[#EEF3EF] px-4 py-3">

            <div className="flex items-center gap-2 text-xs font-medium text-[#56605A]">
              <span className="h-3 w-3 rounded bg-[#18392B]" />
              Completo
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-[#56605A]">
              <span className="h-3 w-3 rounded border border-amber-300 bg-amber-50" />
              Medio día
            </div>

          </div>


          {modifiedRecords.length > 0 && (

            <div className="sticky bottom-20 z-30">

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#18392B] font-semibold text-white shadow-[0_12px_30px_rgba(24,57,43,0.25)] transition hover:bg-[#204A38] disabled:opacity-60"
              >

                <Save size={20} />

                {saving
                  ? "Guardando..."
                  : `Guardar cambios (${modifiedRecords.length})`
                }

              </button>

            </div>

          )}

        </>
      )}


      <DayModal
        open={
          selectedDate !== null
        }
        fecha={selectedDate}
        registro={
          selectedDate
            ? registros[selectedDate]
            : undefined
        }
        onClose={() =>
          setSelectedDate(null)
        }
        onSave={
          handleDaySave
        }
      />

    </div>
  );
}