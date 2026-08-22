import {
  useEffect,
  useState,
} from "react";

import {
  HandCoins,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import {
  anularRendicion,
  getRendicion,
} from "../../features/administracion/api";

import DetailActions
  from "../../features/administracion/components/DetailActions";

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


export default function DetalleRendicionPage() {
  const {
    id,
  } = useParams();

  const [
    item,
    setItem,
  ] =
    useState<RendicionVenta | null>(
      null,
    );


  async function load() {
    if (!id) {
      return;
    }

    setItem(
      await getRendicion(
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
            title={`Rendición #${item.id}`}
            description="Detalle del dinero rendido."
            icon={HandCoins}
            backTo="/administracion/rendiciones/historial"
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
                Rendición de ventas
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Fecha:{" "}
                {formatDate(
                  item.fecha,
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
                min-w-[650px]
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
                    Fecha cobro
                  </th>

                  <th>
                    Comprador
                  </th>

                  <th>
                    Venta
                  </th>

                  <th>
                    Bolsas
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
                          detalle.fecha_pago,
                        )}
                      </td>

                      <td>
                        {
                          detalle.comprador_nombre
                        }
                      </td>

                      <td>
                        #{detalle.venta}
                      </td>

                      <td>
                        {
                          detalle.cantidad_bolsas
                        }
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
              bg-emerald-700
              p-5
              text-white
              print:border
              print:bg-white
              print:text-black
            "
          >
            <p className="text-sm opacity-75">
              Total rendido
            </p>

            <p className="text-3xl font-bold">
              {money(item.total)}
            </p>
          </div>

          <div
            className="
              mt-14
              grid
              grid-cols-2
              gap-10
              print:grid
            "
          >
            <div
              className="
                border-t
                border-slate-500
                pt-2
                text-center
                text-xs
              "
            >
              Entrega
            </div>

            <div
              className="
                border-t
                border-slate-500
                pt-2
                text-center
                text-xs
              "
            >
              Recibe
            </div>
          </div>

          {item.estado === "ANULADA" && (
            <div
              className="
                mt-6
                rounded-xl
                bg-red-50
                p-4
                text-sm
                text-red-700
              "
            >
              <strong>
                Rendición anulada
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
                await anularRendicion(
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