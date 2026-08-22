import {
  useEffect,
  useState,
} from "react";

import {
  Sprout,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import {
  anularLiquidacionAlmacigos,
  getLiquidacionAlmacigos,
} from "../../features/administracion/api";

import DetailActions
  from "../../features/administracion/components/DetailActions";

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


export default function DetalleAlmacigosPage() {
  const {
    id,
  } = useParams();

  const [
    item,
    setItem,
  ] =
    useState<LiquidacionAlmacigo | null>(
      null,
    );


  async function load() {
    if (!id) {
      return;
    }

    setItem(
      await getLiquidacionAlmacigos(
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
      <div className="mx-auto max-w-4xl">
        <div className="print:hidden">
          <PageHeader
            title={`Liquidación #${item.id}`}
            description="Detalle del pago de almácigos."
            icon={Sprout}
            backTo="/administracion/almacigos/historial"
          />
        </div>

        <article
          className="
            rounded-3xl
            border
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
                Liquidación de almácigos
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Pago realizado{" "}
                {formatDate(
                  item.fecha_pago,
                )}
              </p>
            </div>

            <EstadoLiquidacion
              estado={item.estado}
            />
          </div>

          <div
            className="
              mt-7
              overflow-x-auto
            "
          >
            <table
              className="
                w-full
                min-w-[600px]
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
                    Cantidad
                  </th>

                  <th className="text-right">
                    Unitario
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
                          detalle.cantidad
                        }
                      </td>

                      <td className="text-right">
                        {money(
                          detalle
                            .valor_unitario,
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
              Total liquidado
            </p>

            <p className="text-3xl font-bold">
              {money(item.total)}
            </p>
          </div>

          {item.estado === "ANULADA" && (
            <div
              className="
                mt-5
                rounded-xl
                bg-red-50
                p-4
                text-sm
                text-red-700
              "
            >
              <strong>
                Liquidación anulada
              </strong>

              <p className="mt-1">
                {
                  item.motivo_anulacion
                }
              </p>
            </div>
          )}

          <div className="mt-8">
            <DetailActions
              estado={item.estado}
              onAnular={async (
                motivo,
              ) => {
                await anularLiquidacionAlmacigos(
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