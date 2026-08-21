import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type {
  FraccionTarja,
  TarjaLocal,
  TareaTarja,
} from "./types";


interface Props {
  open: boolean;
  fecha: string | null;
  registro?: TarjaLocal;

  onClose: () => void;
  onSave: (registro: TarjaLocal) => void;
}


const tareas = [
  ["plantacion", "Plantación"],
  ["carpida", "Carpida"],
  ["cultivada", "Cultivada"],
  ["riego", "Riego"],
  ["cosecha", "Cosecha"],
  ["embolsado", "Embolsado"],
  ["carga", "Carga"],
  ["paleada", "Paleada"],
  ["otro", "Otro"],
] as const;


export default function DayModal({
  open,
  fecha,
  registro,
  onClose,
  onSave,
}: Props) {

  const [fraccion, setFraccion] =
    useState<FraccionTarja | null>(
      null
    );

  const [tarea, setTarea] =
    useState<TareaTarja | "">("");

  const [observacion, setObservacion] =
    useState("");


  useEffect(() => {

    setFraccion(
      registro?.fraccion ?? null
    );

    setTarea(
      registro?.tarea ?? ""
    );

    setObservacion(
      registro?.observacion ?? ""
    );

  }, [registro, fecha]);


  if (!open || !fecha) {
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
      new Date(`${fecha}T12:00:00`)
    );


  function handleSave() {

    onSave({
      fecha,
      fraccion,
      tarea,
      observacion,
      modified: true,
    });

    onClose();
  }


  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="w-full rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">

        <div className="flex items-start justify-between border-b border-black/5 px-5 py-5">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A837D]">
              Tarja
            </p>

            <h2 className="mt-1 capitalize text-xl font-semibold text-[#1B1E1C]">
              {formattedDate}
            </h2>

          </div>


          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>


        <div className="space-y-6 p-5">

          <div>

            <label className="mb-3 block text-sm font-semibold text-[#343A36]">
              Jornada
            </label>


            <div className="grid grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() =>
                  setFraccion("1.0")
                }
                className={`h-14 rounded-xl border text-sm font-semibold transition ${
                  fraccion === "1.0"
                    ? "border-[#18392B] bg-[#18392B] text-white"
                    : "border-[#E0E5E1] bg-white text-[#59615C]"
                }`}
              >
                Completo
              </button>


              <button
                type="button"
                onClick={() =>
                  setFraccion("0.5")
                }
                className={`h-14 rounded-xl border text-sm font-semibold transition ${
                  fraccion === "0.5"
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-[#E0E5E1] bg-white text-[#59615C]"
                }`}
              >
                Medio día
              </button>


              <button
                type="button"
                onClick={() =>
                  setFraccion(null)
                }
                className={`h-14 rounded-xl border text-sm font-semibold transition ${
                  fraccion === null
                    ? "border-slate-400 bg-slate-100 text-slate-700"
                    : "border-[#E0E5E1] bg-white text-[#59615C]"
                }`}
              >
                Sin trabajo
              </button>

            </div>

          </div>


          {fraccion !== null && (
            <>

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                  Trabajo realizado
                </label>

                <select
                  value={tarea}
                  onChange={(e) =>
                    setTarea(
                      e.target.value as
                        TareaTarja | ""
                    )
                  }
                  className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 outline-none focus:border-[#18392B]"
                >

                  <option value="">
                    Seleccionar tarea
                  </option>

                  {tareas.map(
                    ([value, label]) => (
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


              <div>

                <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                  Observación
                </label>

                <textarea
                  value={observacion}
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


          <button
            onClick={handleSave}
            className="h-13 w-full rounded-xl bg-[#18392B] font-semibold text-white shadow-[0_8px_24px_rgba(24,57,43,0.18)] hover:bg-[#204A38]"
          >
            Aplicar
          </button>

        </div>

      </div>

    </div>
  );
}