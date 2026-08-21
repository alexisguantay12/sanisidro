import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Save,
  UserRound,
} from "lucide-react";

import {
  getTarjasMes,
  saveTarjasMes,
} from "../features/tarjas/api";

import TarjaCalendar
  from "../features/tarjas/TarjaCalendar";

import DayModal
  from "../features/tarjas/DayModal";

import {
  getPeones,
} from "../features/peones/api";

import type {
  Peon,
} from "../features/peones/types";

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

  const today =
    new Date();


  const [
    year,
    setYear,
  ] = useState(
    today.getFullYear()
  );


  const [
    month,
    setMonth,
  ] = useState(
    today.getMonth()
  );


  const [
    peones,
    setPeones,
  ] = useState<Peon[]>([]);


  const [
    peonId,
    setPeonId,
  ] = useState<
    number | null
  >(null);


  const [
    registros,
    setRegistros,
  ] = useState<
    Record<
      string,
      TarjaLocal
    >
  >({});


  const [
    selectedDate,
    setSelectedDate,
  ] = useState<
    string | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  useEffect(() => {
    getPeones().then(
      setPeones
    );
  }, []);


  useEffect(() => {

    if (!peonId) {
      setRegistros({});
      return;
    }

    void loadMonth();

  }, [
    peonId,
    year,
    month,
  ]);


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
        Record<
          string,
          TarjaLocal
        > = {};


      data.forEach(
        (tarja) => {

          map[tarja.fecha] = {
            fecha:
              tarja.fecha,

            fraccion:
              tarja.fraccion,

            tarea:
              tarja.tarea,

            destino:
              tarja.destino ??
              "san_isidro",

            destinatario:
              tarja.destinatario ??
              null,

            destinatario_nombre:
              tarja
                .destinatario_nombre ??
              null,

            observacion:
              tarja.observacion,

            modified: false,
          };
        }
      );


      setRegistros(
        map
      );

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
          (item) =>
            item.modified
        ),
      [registros]
    );


  const cantidadDias =
    Object.values(
      registros
    ).filter(
      (item) =>
        item.fraccion
    ).length;


  const diasCompletos =
    Object.values(
      registros
    ).filter(
      (item) =>
        item.fraccion ===
        "1.0"
    ).length;


  const mediosDias =
    Object.values(
      registros
    ).filter(
      (item) =>
        item.fraccion ===
        "0.5"
    ).length;


  const diasExternos =
    Object.values(
      registros
    ).filter(
      (item) =>
        item.fraccion !== null &&
        item.destino ===
          "externo"
    ).length;


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

      setYear(
        (value) =>
          value - 1
      );

    } else {
      setMonth(
        (value) =>
          value - 1
      );
    }
  }


  function nextMonth() {

    if (month === 11) {
      setMonth(0);

      setYear(
        (value) =>
          value + 1
      );

    } else {
      setMonth(
        (value) =>
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
        () =>
          setMessage(""),
        2500
      );

    } finally {
      setSaving(false);
    }
  }


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
          <div className="mb-6">

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Personal
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
              Tarjas
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#78817B]">
              Registrá los días
              trabajados de cada peón.
            </p>

          </div>


          {/* PEÓN */}
          <section className="mb-4 rounded-[24px] border border-[#E4E8E5] bg-white p-4 shadow-[0_8px_28px_rgba(27,30,28,0.04)] sm:p-5">

            <div className="flex items-start gap-3">

              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#537060] sm:flex">
                <UserRound
                  size={20}
                />
              </div>


              <div className="min-w-0 flex-1">

                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[#8B948E]">
                  Peón
                </label>

                <select
                  value={
                    peonId ??
                    ""
                  }
                  onChange={(e) =>
                    setPeonId(
                      e.target.value
                        ? Number(
                            e.target
                              .value
                          )
                        : null
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] px-4 text-sm font-medium text-[#333936] outline-none focus:border-[#9FB4A6] focus:bg-white focus:ring-4 focus:ring-[#18392B]/5"
                >
                  <option value="">
                    Seleccionar trabajador...
                  </option>

                  {peones.map(
                    (peon) => (
                      <option
                        key={
                          peon.id
                        }
                        value={
                          peon.id
                        }
                      >
                        {
                          peon.nombre
                        }
                      </option>
                    )
                  )}
                </select>

              </div>
            </div>

          </section>


          {!peonId ? (

            <div className="rounded-[24px] border border-[#E4E8E5] bg-white px-6 py-14 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#537060]">
                <UserRound
                  size={22}
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#272C29]">
                Seleccioná un peón
              </h3>

              <p className="mt-1 text-sm text-[#808983]">
                Elegí un trabajador
                para consultar y cargar
                sus tarjas mensuales.
              </p>

            </div>

          ) : (

            <>

              {/* MES */}
              <section className="mb-4 rounded-[24px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

                <div className="flex items-center justify-between gap-3">

                  <button
                    type="button"
                    onClick={
                      previousMonth
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DDE3DF] bg-white text-[#59615C] transition hover:bg-[#F7F8F7]"
                  >
                    <ChevronLeft
                      size={20}
                    />
                  </button>


                  <div className="min-w-0 text-center">

                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#929A95]">
                      Período
                    </p>

                    <h2 className="mt-1 truncate capitalize text-base font-semibold text-[#252A27] sm:text-lg">
                      {monthFormatter.format(
                        new Date(
                          year,
                          month,
                          1
                        )
                      )}
                    </h2>

                  </div>


                  <button
                    type="button"
                    onClick={
                      nextMonth
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#DDE3DF] bg-white text-[#59615C] transition hover:bg-[#F7F8F7]"
                  >
                    <ChevronRight
                      size={20}
                    />
                  </button>

                </div>

              </section>


              {/* RESUMEN */}
              <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                <div className="rounded-[22px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_24px_rgba(27,30,28,0.035)] sm:p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B948E] sm:text-xs">
                    Cargados
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#18392B] sm:text-2xl">
                    {cantidadDias}
                  </p>

                </div>


                <div className="rounded-[22px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_24px_rgba(27,30,28,0.035)] sm:p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B948E] sm:text-xs">
                    Completos
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#18392B] sm:text-2xl">
                    {diasCompletos}
                  </p>

                </div>


                <div className="rounded-[22px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_24px_rgba(27,30,28,0.035)] sm:p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B948E] sm:text-xs">
                    Medios
                  </p>

                  <p className="mt-2 text-xl font-semibold text-[#18392B] sm:text-2xl">
                    {mediosDias}
                  </p>

                </div>


                <div className="rounded-[22px] border border-[#E4E8E5] bg-white p-3 shadow-[0_8px_24px_rgba(27,30,28,0.035)] sm:p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B948E] sm:text-xs">
                    Externos
                  </p>

                  <p className="mt-2 text-xl font-semibold text-sky-700 sm:text-2xl">
                    {diasExternos}
                  </p>

                </div>

              </section>


              {/* CALENDARIO */}
              {loading ? (

                <div className="rounded-[24px] border border-[#E4E8E5] bg-white px-6 py-16 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-[#E2E7E3] border-t-[#18392B]" />

                  <p className="mt-4 text-sm text-[#78817B]">
                    Cargando tarjas...
                  </p>

                </div>

              ) : (

                <TarjaCalendar
                  year={year}

                  month={month}

                  registros={
                    registros
                  }

                  onDayClick={
                    setSelectedDate
                  }
                />

              )}


              {/* LEYENDA */}
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[22px] border border-[#E4E8E5] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(27,30,28,0.035)]">

                <div className="flex items-center gap-2 text-xs font-medium text-[#56605A]">
                  <span className="h-3 w-3 rounded bg-[#18392B]" />
                  Completo
                </div>


                <div className="flex items-center gap-2 text-xs font-medium text-[#56605A]">
                  <span className="h-3 w-3 rounded border border-amber-300 bg-amber-50" />
                  Medio día
                </div>


                <div className="flex items-center gap-2 text-xs font-medium text-[#56605A]">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                  Trabajo externo
                </div>

              </div>


              {/* GUARDAR */}
              {modifiedRecords.length >
                0 && (

                <div className="sticky bottom-20 z-30 mt-4">

                  <button
                    type="button"
                    onClick={
                      handleSave
                    }
                    disabled={
                      saving
                    }
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#18392B] font-semibold text-white shadow-[0_12px_30px_rgba(24,57,43,0.25)] transition hover:bg-[#204A38] disabled:opacity-60"
                  >
                    <Save
                      size={20}
                    />

                    {saving
                      ? "Guardando..."
                      : `Guardar cambios (${modifiedRecords.length})`
                    }

                  </button>

                </div>

              )}

            </>

          )}

        </div>
      </div>


      <DayModal
        open={
          selectedDate !== null
        }

        fecha={
          selectedDate
        }

        registro={
          selectedDate
            ? registros[
                selectedDate
              ]
            : undefined
        }

        peones={
          peones
        }

        peonId={
          peonId
        }

        onClose={() =>
          setSelectedDate(
            null
          )
        }

        onSave={
          handleDaySave
        }
      />

    </>
  );
}