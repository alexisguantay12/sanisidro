import {
  useEffect,
  useState,
} from "react";

import {
  ChevronRight,
  HandCoins,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getRendiciones,
} from "../../features/administracion/api";

import AdministracionTabs
  from "../../features/administracion/components/AdministracionTabs";

import EmptyState
  from "../../features/administracion/components/EmptyState";

import EstadoLiquidacion
  from "../../features/administracion/components/EstadoLiquidacion";

import PageHeader
  from "../../features/administracion/components/PageHeader";

import type {
  RendicionVenta,
} from "../../features/administracion/types";

import {
  formatDate,
  money,
} from "../../features/administracion/utils";


export default function HistorialRendicionesPage() {
  const [
    items,
    setItems,
  ] =
    useState<RendicionVenta[]>([]);


  useEffect(() => {
    getRendiciones()
      .then(setItems);
  }, []);


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Rendición de ventas"
          description="Historial de dinero rendido."
          icon={HandCoins}
        />

        <AdministracionTabs
          pendientesTo="/administracion/rendiciones"
          historialTo="/administracion/rendiciones/historial"
        />

        {items.length === 0 ? (
          <EmptyState
            title="Sin rendiciones"
          />
        ) : (
          <div className="space-y-3">
            {items.map(
              (item) => (
                <Link
                  key={item.id}
                  to={
                    `/administracion/rendiciones/${item.id}`
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                    sm:p-5
                  "
                >
                  <div>
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >
                      <p className="font-bold">
                        Rendición #{item.id}
                      </p>

                      <EstadoLiquidacion
                        estado={item.estado}
                      />
                    </div>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-slate-500
                      "
                    >
                      {formatDate(
                        item.fecha,
                      )}
                      {" · "}
                      {
                        item.detalles.length
                      } cobros
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <p
                      className="
                        text-lg
                        font-bold
                      "
                    >
                      {money(item.total)}
                    </p>

                    <ChevronRight
                      size={20}
                      className="text-slate-400"
                    />
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}