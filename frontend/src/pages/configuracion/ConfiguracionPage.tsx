import {
  ArrowRight,
  Banknote,
  FlaskConical,
  Settings2,
  Truck,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

const opciones = [
  {
    title: "Proveedores",
    description:
      "Administrar proveedores utilizados en tractor y otros servicios.",
    path: "/configuracion/proveedores",
    icon: Truck,
  },
  {
    title: "Insumos",
    description:
      "Administrar el catálogo de herbicidas, fertilizantes y demás insumos.",
    path: "/configuracion/insumos",
    icon: FlaskConical,
  },
  {
    title: "Valores",
    description:
      "Configurar valor jornal y valor hora del tractor de Sergio.",
    path: "/configuracion/valores",
    icon: Banknote,
  },
];

export default function ConfiguracionPage() {
  const navigate =
    useNavigate();

  return (
    <div className="min-h-full bg-[#F6F8F6]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        <div className="mb-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18392B] text-white">
            <Settings2 size={20} />
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
            Sistema
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
            Configuración
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#78817B]">
            Administrá datos maestros y
            valores utilizados por los
            distintos módulos de San Isidro.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opciones.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() =>
                    navigate(
                      item.path
                    )
                  }
                  className="group rounded-[26px] border border-[#E4E8E5] bg-white p-5 text-left shadow-[0_8px_28px_rgba(27,30,28,0.04)] transition hover:-translate-y-0.5 hover:border-[#CCD8D0] hover:shadow-[0_12px_32px_rgba(27,30,28,0.07)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#18392B]">
                      <Icon size={22} />
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl text-[#9AA29D] transition group-hover:bg-[#F2F5F3] group-hover:text-[#18392B]">
                      <ArrowRight size={17} />
                    </div>
                  </div>

                  <h2 className="mt-5 text-base font-semibold text-[#242925]">
                    {item.title}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#7B847E]">
                    {item.description}
                  </p>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}