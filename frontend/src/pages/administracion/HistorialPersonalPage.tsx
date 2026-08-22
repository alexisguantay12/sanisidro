import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  ChevronRight,
  Search,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getLiquidacionesPersonal,
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
  LiquidacionPersonal,
} from "../../features/administracion/types";

import {
  formatDate,
  money,
} from "../../features/administracion/utils";


export default function HistorialPersonalPage() {
  const [
    items,
    setItems,
  ] =
    useState<LiquidacionPersonal[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(() => {
    getLiquidacionesPersonal()
      .then(setItems)
      .finally(() =>
        setLoading(false)
      );
  }, []);


  const filtered =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return items;
      }

      return items.filter(
        (item) =>
          item.peon_nombre
            .toLowerCase()
            .includes(value)
          ||
          String(item.id)
            .includes(value),
      );
    }, [
      items,
      search,
    ]);


  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <PageHeader
          title="Pagos al personal"
          description="Historial de liquidaciones realizadas."
          icon={Banknote}
        />

        <AdministracionTabs
          pendientesTo="/administracion/personal"
          historialTo="/administracion/personal/historial"
        />

        <div
          className="
            relative
            mb-5
          "
        >
          <Search
            size={18}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            placeholder="Buscar peón o número..."
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              py-3
              pl-10
              pr-4
              outline-none
              focus:border-emerald-400
            "
          />
        </div>

        {loading ? (
          <div
            className="
              py-12
              text-center
              text-sm
              text-slate-500
            "
          >
            Cargando...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Sin liquidaciones"
            description="Todavía no existen liquidaciones para mostrar."
          />
        ) : (
          <div
            className="
              space-y-3
            "
          >
            {filtered.map(
              (item) => (
                <Link
                  key={item.id}
                  to={
                    `/administracion/personal/${item.id}`
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
                    hover:border-emerald-200
                    hover:shadow-md
                    sm:p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        min-w-0
                      "
                    >
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
                        {item.peon_nombre}
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        {formatDate(
                          item.fecha_desde,
                        )}
                        {" — "}
                        {formatDate(
                          item.fecha_hasta,
                        )}
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-slate-400
                        "
                      >
                        Pago:{" "}
                        {formatDate(
                          item.fecha_pago,
                        )}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-3
                      "
                    >
                      <p
                        className="
                          text-lg
                          font-bold
                          text-slate-900
                        "
                      >
                        {money(
                          item.total,
                        )}
                      </p>

                      <ChevronRight
                        size={20}
                        className="
                          text-slate-400
                        "
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