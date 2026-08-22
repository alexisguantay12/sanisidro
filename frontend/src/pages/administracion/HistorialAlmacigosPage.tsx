import {
  useEffect,
  useState,
} from "react";

import {
  ChevronRight,
  Sprout,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getLiquidacionesAlmacigos,
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
  LiquidacionAlmacigo,
} from "../../features/administracion/types";

import {
  formatDate,
  money,
} from "../../features/administracion/utils";


export default function HistorialAlmacigosPage() {
  const [
    items,
    setItems,
  ] =
    useState<LiquidacionAlmacigo[]>([]);


  useEffect(() => {
    getLiquidacionesAlmacigos()
      .then(setItems);
  }, []);


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Pago de almácigos"
          description="Historial de liquidaciones."
          icon={Sprout}
        />

        <AdministracionTabs
          pendientesTo="/administracion/almacigos"
          historialTo="/administracion/almacigos/historial"
        />

        {items.length === 0 ? (
          <EmptyState
            title="Sin liquidaciones"
          />
        ) : (
          <div className="space-y-3">
            {items.map(
              (item) => (
                <Link
                  key={item.id}
                  to={
                    `/administracion/almacigos/${item.id}`
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
                    hover:shadow-md
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
                        Liquidación #{item.id}
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
                      {
                        item.cantidad_total
                      } almácigos
                      {" · "}
                      {formatDate(
                        item.fecha_pago,
                      )}
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