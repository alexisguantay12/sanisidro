import {
  useEffect,
  useState,
} from "react";

import {
  ChevronRight,
  Tractor,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getLiquidacionesTractor,
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
  LiquidacionTractor,
} from "../../features/administracion/types";

import {
  formatDate,
  money,
} from "../../features/administracion/utils";


export default function HistorialTractorPage() {
  const [
    items,
    setItems,
  ] =
    useState<LiquidacionTractor[]>([]);


  useEffect(() => {
    getLiquidacionesTractor()
      .then(setItems);
  }, []);


  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        sm:px-6
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <PageHeader
          title="Pago de tractor"
          description="Historial de pagos realizados."
          icon={Tractor}
        />

        <AdministracionTabs
          pendientesTo="/administracion/tractor"
          historialTo="/administracion/tractor/historial"
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
                    `/administracion/tractor/${item.id}`
                  }
                  className="
                    block
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
                    shadow-sm
                    transition
                    hover:shadow-md
                    sm:p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
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
                        <p
                          className="
                            font-bold
                            text-slate-900
                          "
                        >
                          Liquidación #{item.id}
                        </p>

                        <EstadoLiquidacion
                          estado={item.estado}
                        />
                      </div>

                      <p
                        className="
                          mt-2
                          font-semibold
                          text-slate-700
                        "
                      >
                        {
                          item.tipo === "SERGIO"
                            ? "Sergio"
                            : item.proveedor_nombre
                        }
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        {item.total_horas} hs
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
                        {money(
                          item.total,
                        )}
                      </p>

                      <ChevronRight
                        size={20}
                        className="text-slate-400"
                      />
                    </div>
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