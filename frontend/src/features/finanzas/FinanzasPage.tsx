import {
  ArrowLeftRight,
  ChevronRight,
  FolderTree,
  Landmark,
  Tags,
  WalletCards,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


const opciones = [
  {
    title: "Movimientos",
    description:
      "Ingresos, gastos y transferencias.",
    path: "/finanzas/movimientos",
    icon: ArrowLeftRight,
    footer:
      "Carga rápida desde celular",
    iconClass:
      "bg-[#EAF2ED] text-[#18392B]",
  },

  {
    title: "Cuentas",
    description:
      "Saldos e historial por cuenta.",
    path: "/finanzas/cuentas",
    icon: Landmark,
    footer:
      "Naranja X, BBVA, efectivo y otras",
    iconClass:
      "bg-[#EDF1F5] text-[#40546B]",
  },

  {
    title: "Resumen",
    description:
      "Ingresos, gastos y resultados.",
    path: "/finanzas/resumen",
    icon: WalletCards,
    footer:
      "Análisis mensual y acumulado",
    iconClass:
      "bg-[#F2EEE4] text-[#6F5A2C]",
  },

  {
    title: "Categorías",
    description:
      "Organizá cada movimiento.",
    path: "/finanzas/categorias",
    icon: Tags,
    footer:
      "Sueldo, combustible, servicios...",
    iconClass:
      "bg-[#F1EDF4] text-[#685371]",
  },

  {
    title: "Grupos",
    description:
      "Agrupá categorías para reportes.",
    path: "/finanzas/grupos",
    icon: FolderTree,
    footer:
      "Ingresos, gastos, Auto, San Isidro...",
    iconClass:
      "bg-[#F5EFE9] text-[#745942]",
  },
];


export default function FinanzasPage() {

  const navigate =
    useNavigate();

  return (
    <div className="mx-auto w-full max-w-3xl">

      <header className="mb-7">

        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7A837D]">
          Personal
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#1B1E1C]">
          Finanzas
        </h1>

        <p className="mt-2 max-w-lg text-sm leading-6 text-[#6B746E]">
          Administrá movimientos, cuentas
          y analizá tu situación financiera.
        </p>

      </header>


      <div className="space-y-4">

        {opciones.map(
          (opcion) => {

            const Icon =
              opcion.icon;

            return (
              <button
                key={opcion.path}
                type="button"
                onClick={() =>
                  navigate(
                    opcion.path
                  )
                }
                className="group w-full rounded-[24px] border border-[#E2E7E3] bg-white p-5 text-left shadow-[0_3px_16px_rgba(20,30,24,0.04)] transition hover:-translate-y-0.5 hover:border-[#CAD5CD] hover:shadow-[0_10px_28px_rgba(20,30,24,0.08)] sm:p-6"
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${opcion.iconClass}`}
                  >
                    <Icon size={27} />
                  </div>


                  <div className="min-w-0 flex-1">

                    <h2 className="text-lg font-semibold text-[#1B1E1C]">
                      {opcion.title}
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[#737C76]">
                      {opcion.description}
                    </p>

                  </div>


                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#8A938D] transition group-hover:bg-[#F3F6F4] group-hover:text-[#18392B]">

                    <ChevronRight
                      size={21}
                    />

                  </div>

                </div>


                <div className="mt-5 border-t border-[#EEF1EF] pt-4">

                  <p className="text-xs font-medium text-[#88918B]">
                    {opcion.footer}
                  </p>

                </div>

              </button>
            );
          }
        )}

      </div>

    </div>
  );
}