import {
  useEffect,
  useState,
} from "react";

import {
  Tractor,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import {
  anularLiquidacionTractor,
  getLiquidacionTractor,
} from "../../features/administracion/api";

import DetailActions
  from "../../features/administracion/components/DetailActions";

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


export default function DetalleTractorPage() {
  const {
    id,
  } = useParams();

  const [
    item,
    setItem,
  ] =
    useState<LiquidacionTractor | null>(
      null,
    );


  async function load() {
    if (!id) {
      return;
    }

    setItem(
      await getLiquidacionTractor(
        Number(id),
      ),
    );
  }


  useEffect(() => {
    load();
  }, [
    id,
  ]);


  if (!item) {
    return (
      <div className="p-8 text-center">
        Cargando...
      </div>
    );
  }


  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        print:bg-white
      "
    >
      <div
        className="
          mx-auto
          max-w-4xl
        "
      >
        <div className="print:hidden">
          <PageHeader
            title={`Liquidación tractor #${item.id}`}
            description="Detalle del pago realizado."
            icon={Tractor}
            backTo="/administracion/tractor/historial"
          />
        </div>

        <article
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-8
            print:border-0
            print:shadow-none
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
            <div>
              <p
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                San Isidro
              </p>

              <h1
                className="
                  mt-1
                  text-2xl
                  font-bold
                "
              >
                Liquidación de tractor
              </h1>

              <p
                className="
                  mt-2
                  text-slate-600
                "
              >
                {
                  item.tipo === "SERGIO"
                    ? "Sergio"
                    : item.proveedor_nombre
                }
              </p>
            </div>

            <EstadoLiquidacion
              estado={item.estado}
            />
          </div>

          <div
            className="
              mt-6
              grid
              grid-cols-2
              gap-4
              sm:grid-cols-4
            "
          >
            <Info
              title="Desde"
              value={
                formatDate(
                  item.fecha_desde,
                )
              }
            />

            <Info
              title="Hasta"
              value={
                formatDate(
                  item.fecha_hasta,
                )
              }
            />

            <Info
              title="Pago"
              value={
                formatDate(
                  item.fecha_pago,
                )
              }
            />

            <Info
              title="Horas"
              value={`${item.total_horas} hs`}
            />
          </div>

          <div
            className="
              mt-8
              overflow-x-auto
            "
          >
            <table
              className="
                w-full
                min-w-[620px]
                text-sm
              "
            >
              <thead>
                <tr
                  className="
                    border-b
                    text-left
                    text-xs
                    uppercase
                    text-slate-400
                  "
                >
                  <th className="py-3">
                    Fecha
                  </th>

                  <th>
                    Horas
                  </th>

                  <th className="text-right">
                    Valor hora
                  </th>

                  <th className="text-right">
                    Importe
                  </th>
                </tr>
              </thead>

              <tbody>
                {item.detalles.map(
                  (detalle) => (
                    <tr
                      key={detalle.id}
                      className="border-b"
                    >
                      <td className="py-3">
                        {formatDate(
                          detalle.fecha,
                        )}
                      </td>

                      <td>
                        {
                          detalle.cantidad_horas
                        }
                      </td>

                      <td className="text-right">
                        {money(
                          detalle.valor_hora,
                        )}
                      </td>

                      <td
                        className="
                          text-right
                          font-semibold
                        "
                      >
                        {money(
                          detalle.importe,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <Total
            value={item.total}
          />

          {item.estado === "ANULADA" && (
            <Anulada
              motivo={
                item.motivo_anulacion
              }
            />
          )}

          <div className="mt-8">
            <DetailActions
              estado={item.estado}
              onAnular={async (
                motivo,
              ) => {
                await anularLiquidacionTractor(
                  item.id,
                  motivo,
                );

                await load();
              }}
            />
          </div>
        </article>
      </div>
    </main>
  );
}


function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}


function Total({
  value,
}: {
  value: string;
}) {
  return (
    <div
      className="
        mt-8
        rounded-2xl
        bg-slate-900
        p-5
        text-white
        print:border
        print:bg-white
        print:text-black
      "
    >
      <p className="text-sm opacity-70">
        Total
      </p>

      <p className="text-3xl font-bold">
        {money(value)}
      </p>
    </div>
  );
}


function Anulada({
  motivo,
}: {
  motivo: string;
}) {
  return (
    <div
      className="
        mt-5
        rounded-xl
        border
        border-red-200
        bg-red-50
        p-4
        text-sm
        text-red-700
      "
    >
      <strong>
        Liquidación anulada.
      </strong>

      <p className="mt-1">
        {motivo}
      </p>
    </div>
  );
}