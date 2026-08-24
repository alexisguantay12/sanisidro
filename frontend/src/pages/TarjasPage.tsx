import {
  ChevronRight,
  ClipboardList,
  Sprout,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


export default function TarjasPage() {

  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-3xl">

      <header className="mb-7">

        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7A837D]">
          Personal
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#1B1E1C]">
          Tarjas
        </h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-[#6B746E]">
          Administrá los jornales de los peones
          y los trabajos realizados en carpida.
        </p>

      </header>


      <div className="space-y-4">

        {/* JORNALES */}
        <button
          type="button"
          onClick={() =>
            navigate("/tarjas/jornales")
          }
          className="group w-full rounded-[24px] border border-[#E2E7E3] bg-white p-5 text-left shadow-[0_3px_16px_rgba(20,30,24,0.04)] transition hover:-translate-y-0.5 hover:border-[#CAD5CD] hover:shadow-[0_10px_28px_rgba(20,30,24,0.08)] sm:p-6"
        >
          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2ED] text-[#18392B]">
              <ClipboardList size={27} />
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-lg font-semibold text-[#1B1E1C]">
                Jornales
              </h2>

              <p className="mt-1 text-sm leading-5 text-[#737C76]">
                Registro diario de jornadas realizadas
                por los peones.
              </p>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#8A938D] transition group-hover:bg-[#F3F6F4] group-hover:text-[#18392B]">
              <ChevronRight size={21} />
            </div>

          </div>

          <div className="mt-5 border-t border-[#EEF1EF] pt-4">

            <p className="text-xs font-medium text-[#88918B]">
              Selección de peones y registro de jornadas
            </p>

          </div>
        </button>


        {/* CARPIDA */}
        <button
          type="button"
          onClick={() =>
            navigate("/tarjas/carpida")
          }
          className="group w-full rounded-[24px] border border-[#E2E7E3] bg-white p-5 text-left shadow-[0_3px_16px_rgba(20,30,24,0.04)] transition hover:-translate-y-0.5 hover:border-[#CAD5CD] hover:shadow-[0_10px_28px_rgba(20,30,24,0.08)] sm:p-6"
        >
          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F2EEE4] text-[#6F5A2C]">
              <Sprout size={27} />
            </div>

            <div className="min-w-0 flex-1">

              <h2 className="text-lg font-semibold text-[#1B1E1C]">
                Jornales de carpida
              </h2>

              <p className="mt-1 text-sm leading-5 text-[#737C76]">
                Registro de días y medios días
                correspondientes a trabajos de carpida.
              </p>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#8A938D] transition group-hover:bg-[#F3F6F4] group-hover:text-[#18392B]">
              <ChevronRight size={21} />
            </div>

          </div>

          <div className="mt-5 border-t border-[#EEF1EF] pt-4">

            <p className="text-xs font-medium text-[#88918B]">
              Día completo equivale a dos jornales
            </p>

          </div>
        </button>

      </div>

    </div>
  );
}