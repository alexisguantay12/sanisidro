import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Building2,
  MapPin,
  UserRound,
  X,
} from "lucide-react";

import type {
  Peon,
} from "../peones/types";

import type {
  DestinoTarja,
  FraccionTarja,
  TarjaLocal,
  TareaTarja,
} from "./types";


interface Props {
  open: boolean;

  fecha: string | null;

  registro?: TarjaLocal;

  peones: Peon[];

  peonId: number | null;

  onClose: () => void;

  onSave: (
    registro: TarjaLocal
  ) => void;
}


const tareas = [
  [
    "plantacion",
    "Plantación",
  ],
  [
    "carpida",
    "Carpida",
  ],
  [
    "cultivada",
    "Cultivada",
  ],
  [
    "riego",
    "Riego",
  ],
  [
    "cosecha",
    "Cosecha",
  ],
  [
    "embolsado",
    "Embolsado",
  ],
  [
    "carga",
    "Carga",
  ],
  [
    "paleada",
    "Paleada",
  ],
  [
    "otro",
    "Otro",
  ],
] as const;


export default function DayModal({
  open,
  fecha,
  registro,
  peones,
  peonId,
  onClose,
  onSave,
}: Props) {

  const [
    fraccion,
    setFraccion,
  ] = useState<
    FraccionTarja | null
  >(null);

  const [
    tarea,
    setTarea,
  ] = useState<
    TareaTarja | ""
  >("");

  const [
    destino,
    setDestino,
  ] = useState<DestinoTarja>(
    "san_isidro"
  );

  const [
    destinatario,
    setDestinatario,
  ] = useState<
    number | null
  >(null);

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    if (!open) {
      return;
    }

    setFraccion(
      registro?.fraccion ??
      null
    );

    setTarea(
      registro?.tarea ??
      ""
    );

    setDestino(
      registro?.destino ??
      "san_isidro"
    );

    setDestinatario(
      registro?.destinatario ??
      null
    );

    setObservacion(
      registro?.observacion ??
      ""
    );

    setError("");

  }, [
    open,
    registro,
    fecha,
  ]);


  const destinatariosDisponibles =
    useMemo(
      () =>
        peones
          .filter(
            (peon) =>
              peon.activo &&
              peon.id !== peonId
          )
          .sort(
            (a, b) =>
              a.nombre.localeCompare(
                b.nombre,
                "es",
                {
                  sensitivity:
                    "base",
                }
              )
          ),
      [
        peones,
        peonId,
      ]
    );


  if (
    !open ||
    !fecha
  ) {
    return null;
  }


  const formattedDate =
    new Intl.DateTimeFormat(
      "es-AR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    ).format(
      new Date(
        `${fecha}T12:00:00`
      )
    );


  function handleDestinoChange(
    nuevoDestino: DestinoTarja
  ) {
    setDestino(
      nuevoDestino
    );

    setError("");

    if (
      nuevoDestino ===
      "san_isidro"
    ) {
      setDestinatario(null);
    }
  }


  function handleSave() {
    if (!fecha) {
      return;
    }

    if (
      fraccion !== null &&
      destino === "externo" &&
      !destinatario
    ) {
      setError(
        "Seleccioná para quién se realizó el trabajo."
      );

      return;
    }

    const destinatarioData =
      destinatario
        ? peones.find(
            (peon) =>
              peon.id ===
              destinatario
          )
        : null;

    onSave({
      fecha,

      fraccion,

      tarea:
        fraccion !== null
          ? tarea
          : "",

      destino:
        fraccion !== null
          ? destino
          : "san_isidro",

      destinatario:
        fraccion !== null &&
        destino === "externo"
          ? destinatario
          : null,

      destinatario_nombre:
        fraccion !== null &&
        destino === "externo"
          ? (
              destinatarioData
                ?.nombre ??
              null
            )
          : null,

      observacion:
        fraccion !== null
          ? observacion
          : "",

      modified: true,
    });

    onClose();
  }


  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div
        className="
          flex w-full flex-col
          max-h-[90dvh]
          rounded-t-[28px]
          bg-white
          shadow-2xl
          sm:max-h-[90vh]
          sm:max-w-md
          sm:rounded-[28px]
        "
      >

        {/* HEADER */}
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A837D]">
              Tarja
            </p>

            <h2 className="mt-1 capitalize text-xl font-semibold text-[#1B1E1C]">
              {formattedDate}
            </h2>
          </div>


          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#747D77] transition hover:bg-[#F3F5F3]"
          >
            <X size={20} />
          </button>

        </div>


        {/* CONTENIDO */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {/* JORNADA */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-[#343A36]">
              Jornada
            </label>

            <div className="grid grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() =>
                  setFraccion(
                    "1.0"
                  )
                }
                className={`
                  h-14 rounded-xl
                  border
                  text-sm font-semibold
                  transition
                  ${
                    fraccion === "1.0"
                      ? "border-[#18392B] bg-[#18392B] text-white"
                      : "border-[#E0E5E1] bg-white text-[#59615C]"
                  }
                `}
              >
                Completo
              </button>


              <button
                type="button"
                onClick={() =>
                  setFraccion(
                    "0.5"
                  )
                }
                className={`
                  h-14 rounded-xl
                  border
                  text-sm font-semibold
                  transition
                  ${
                    fraccion === "0.5"
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-[#E0E5E1] bg-white text-[#59615C]"
                  }
                `}
              >
                Medio día
              </button>


              <button
                type="button"
                onClick={() => {
                  setFraccion(null);

                  setDestino(
                    "san_isidro"
                  );

                  setDestinatario(
                    null
                  );

                  setError("");
                }}
                className={`
                  h-14 rounded-xl
                  border
                  text-sm font-semibold
                  transition
                  ${
                    fraccion === null
                      ? "border-slate-400 bg-slate-100 text-slate-700"
                      : "border-[#E0E5E1] bg-white text-[#59615C]"
                  }
                `}
              >
                Sin trabajo
              </button>

            </div>
          </div>


          {fraccion !== null && (
            <>

              {/* TAREA */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                  Trabajo realizado
                </label>

                <select
                  value={tarea}
                  onChange={(e) =>
                    setTarea(
                      e.target
                        .value as
                        | TareaTarja
                        | ""
                    )
                  }
                  className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 outline-none focus:border-[#18392B]"
                >
                  <option value="">
                    Seleccionar tarea
                  </option>

                  {tareas.map(
                    ([
                      value,
                      label,
                    ]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>


              {/* DESTINO */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-[#343A36]">
                  Destino del trabajo
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* SAN ISIDRO */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDestinoChange(
                        "san_isidro"
                      )
                    }
                    className={`
                      flex min-h-[76px]
                      items-center gap-3
                      rounded-2xl
                      border
                      p-3
                      text-left
                      transition
                      ${
                        destino ===
                        "san_isidro"
                          ? "border-[#18392B] bg-[#EEF3EF]"
                          : "border-[#E0E5E1] bg-white hover:bg-[#F8F9F8]"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          destino ===
                          "san_isidro"
                            ? "bg-[#18392B] text-white"
                            : "bg-[#F3F5F3] text-[#737C76]"
                        }
                      `}
                    >
                      <Building2
                        size={19}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#343A36]">
                        San Isidro
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#88918B]">
                        Trabajo propio
                      </p>
                    </div>
                  </button>


                  {/* EXTERNO */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDestinoChange(
                        "externo"
                      )
                    }
                    className={`
                      flex min-h-[76px]
                      items-center gap-3
                      rounded-2xl
                      border
                      p-3
                      text-left
                      transition
                      ${
                        destino ===
                        "externo"
                          ? "border-[#18392B] bg-[#EEF3EF]"
                          : "border-[#E0E5E1] bg-white hover:bg-[#F8F9F8]"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          destino ===
                          "externo"
                            ? "bg-[#18392B] text-white"
                            : "bg-[#F3F5F3] text-[#737C76]"
                        }
                      `}
                    >
                      <MapPin
                        size={19}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-[#343A36]">
                        Externo
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#88918B]">
                        Para otro peón
                      </p>
                    </div>
                  </button>

                </div>
              </div>


              {/* DESTINATARIO */}
              {destino ===
                "externo" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                    Destinatario
                  </label>

                  <div className="relative">
                    <UserRound
                      size={18}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8C958F]"
                    />

                    <select
                      value={
                        destinatario ??
                        ""
                      }
                      onChange={(e) => {
                        setDestinatario(
                          e.target.value
                            ? Number(
                                e.target
                                  .value
                              )
                            : null
                        );

                        setError("");
                      }}
                      className="h-12 w-full appearance-none rounded-xl border border-[#E0E5E1] bg-white pl-11 pr-4 text-sm font-medium text-[#343A36] outline-none focus:border-[#18392B]"
                    >
                      <option value="">
                        Seleccionar destinatario
                      </option>

                      {destinatariosDisponibles.map(
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

                  <p className="mt-2 text-xs leading-5 text-[#8A938D]">
                    Este jornal quedará
                    registrado como trabajo
                    realizado para esta
                    persona.
                  </p>
                </div>
              )}


              {/* OBSERVACIÓN */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                  Observación
                </label>

                <textarea
                  value={
                    observacion
                  }
                  onChange={(e) =>
                    setObservacion(
                      e.target.value
                    )
                  }
                  placeholder="Opcional"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#E0E5E1] p-4 outline-none focus:border-[#18392B]"
                />
              </div>

            </>
          )}

        </div>


        {/* FOOTER */}
        <div
          className="
            shrink-0
            border-t border-black/5
            bg-white
            px-5
            pt-3
            pb-[calc(env(safe-area-inset-bottom)+16px)]
            sm:pb-5
          "
        >
          <button
            type="button"
            onClick={
              handleSave
            }
            className="h-13 w-full rounded-xl bg-[#18392B] font-semibold text-white shadow-[0_8px_24px_rgba(24,57,43,0.18)] transition hover:bg-[#204A38]"
          >
            Aplicar
          </button>
        </div>

      </div>
    </div>
  );
}