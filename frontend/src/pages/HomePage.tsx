import {
  CalendarDays,
  Clock3,
  Tractor,
  Sprout,
  ShoppingBag,
  BarChart3,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

const modules = [
  {
    title: "Tarjas",
    description: "Registrar jornadas",
    icon: CalendarDays,
    to: "/tarjas",
  },
  {
    title: "Horas extra",
    description: "Registrar horas",
    icon: Clock3,
    to: "/horas-extra",
  },
  {
    title: "Tractor",
    description: "Horas y trabajos",
    icon: Tractor,
    to: "/tractor",
  },
  {
    title: "Insumos",
    description: "Uso en la tierra",
    icon: Sprout,
    to: "/insumos",
  },
  {
    title: "Ventas",
    description: "Registrar ventas",
    icon: ShoppingBag,
    to: "/ventas",
  },
  {
    title: "Resumen",
    description: "Ver campaña",
    icon: BarChart3,
    to: "/resumen",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm text-slate-500">
          Gestión de campaña
        </p>

        <h2 className="mt-1 text-2xl font-semibold">
          ¿Qué querés cargar?
        </h2>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Link
              key={module.title}
              to={module.to}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Icon size={23} />
              </div>

              <h3 className="font-semibold">
                {module.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                {module.description}
              </p>
            </Link>
          );
        })}
      </section>

      <section>
        <Link
          to="/peones"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <Users size={21} />
          </div>

          <div>
            <p className="font-medium">
              Peones
            </p>

            <p className="text-xs text-slate-500">
              Administrar trabajadores
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}