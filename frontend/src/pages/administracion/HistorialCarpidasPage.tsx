
import { useEffect, useState } from "react";
import { ChevronRight, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { getLiquidacionesCarpidas } from "../../features/administracion/api";
import AdministracionTabs from "../../features/administracion/components/AdministracionTabs";
import EmptyState from "../../features/administracion/components/EmptyState";
import EstadoLiquidacion from "../../features/administracion/components/EstadoLiquidacion";
import PageHeader from "../../features/administracion/components/PageHeader";
import type { LiquidacionCarpida } from "../../features/administracion/types";
import { formatDate, money } from "../../features/administracion/utils";

export default function HistorialCarpidasPage() {
  const [items, setItems] = useState<LiquidacionCarpida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    getLiquidacionesCarpidas()
      .then((data) => {
        if (activo) setItems(data);
      })
      .catch(() => {
        if (activo) {
          setError("No se pudo cargar el historial de carpidas.");
        }
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Pago de carpidas"
          description="Historial de liquidaciones realizadas."
          icon={Wheat}
        />

        <AdministracionTabs
          pendientesTo="/administracion/carpidas"
          historialTo="/administracion/carpidas/historial"
        />

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            Cargando liquidaciones...
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Sin liquidaciones" />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/administracion/carpidas/${item.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">
                      Liquidación #{item.id}
                    </p>
                    <EstadoLiquidacion estado={item.estado} />
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.cantidad_carpidas} carpidas
                    {" · "}
                    {formatDate(item.fecha_pago)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Período: {formatDate(item.fecha_desde)}
                    {" al "}
                    {formatDate(item.fecha_hasta)}
                  </p>

                  {item.cuenta_financiera_nombre && (
                    <p className="mt-1 text-xs text-slate-500">
                      {item.cuenta_financiera_nombre}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-lg font-bold">
                    {money(item.total)}
                  </p>
                  <ChevronRight
                    size={20}
                    className="text-slate-400"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
