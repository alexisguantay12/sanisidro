import {
  useEffect,
  useState,
} from "react";

import {
  Banknote,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import {
  anularLiquidacionPersonal,
  getLiquidacionPersonal,
} from "../../features/administracion/api";

import DetailActions
  from "../../features/administracion/components/DetailActions";

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


export default function DetallePersonalPage() {
  const {
    id,
  } = useParams();

  const [
    item,
    setItem,
  ] =
    useState<LiquidacionPersonal | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function load() {
    if (!id) {
      return;
    }

    const result =
      await getLiquidacionPersonal(
        Number(id),
      );

    setItem(result);
  }


  useEffect(() => {
    load();
  }, [
    id,
  ]);


  async function anular(
    motivo: string,
  ) {
    if (!item) {
      return;
    }

    try {
      setLoading(true);

      await anularLiquidacionPersonal(
        item.id,
        motivo,
      );

      await load();
    } finally {
      setLoading(false);
    }
  }


  if (!item) {
    return (
      <div
        className="
          p-8
          text-center
          text-slate-500
        "
      >
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
        sm:px-6
        print:bg-white
        print:p-0
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
            title={`Liquidación #${item.id}`}
            description="Detalle completo del pago realizado."
            icon={Banknote}
            backTo="/administracion/personal/historial"
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
            print:p-0
            print:shadow-none
          "
        >
          <header
            className="
              border-b
              border-slate-200
              pb-6
            "
          >
            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
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
                    text-slate-900
                  "
                >
                  Liquidación de personal
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Comprobante #{item.id}
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
              <div>
                <p className="text-xs text-slate-400">
                  Peón
                </p>

                <p className="mt-1 font-semibold">
                  {item.peon_nombre}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Desde
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(
                    item.fecha_desde,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Hasta
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(
                    item.fecha_hasta,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Fecha de pago
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(
                    item.fecha_pago,
                  )}
                </p>
              </div>
            </div>
          </header>

          <section className="mt-7">
            <h2
              className="
                text-lg
                font-bold
                text-slate-900
              "
            >
              Tarjas
            </h2>

            <div
              className="
                mt-3
                overflow-x-auto
              "
            >
              <table
                className="
                  w-full
                  min-w-[600px]
                  text-left
                  text-sm
                "
              >
                <thead>
                  <tr
                    className="
                      border-b
                      border-slate-200
                      text-xs
                      uppercase
                      text-slate-400
                    "
                  >
                    <th className="py-3">
                      Fecha
                    </th>

                    <th>
                      Jornal
                    </th>

                    <th>
                      Tarea
                    </th>

                    <th className="text-right">
                      Jornal aplicado
                    </th>

                    <th className="text-right">
                      Importe
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {item.detalles_tarjas.map(
                    (detalle) => (
                      <tr
                        key={detalle.id}
                        className="
                          border-b
                          border-slate-100
                        "
                      >
                        <td className="py-3">
                          {formatDate(
                            detalle.fecha,
                          )}
                        </td>

                        <td>
                          {detalle.fraccion}
                        </td>

                        <td>
                          {
                            detalle.tarea_display
                            ||
                            "-"
                          }
                        </td>

                        <td className="text-right">
                          {money(
                            detalle
                              .valor_jornal_aplicado,
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
                mt-3
                text-right
                font-bold
              "
            >
              Subtotal:{" "}
              {money(
                item.total_tarjas,
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2
              className="
                text-lg
                font-bold
                text-slate-900
              "
            >
              Horas extra
            </h2>

            <div
              className="
                mt-3
                overflow-x-auto
              "
            >
              <table
                className="
                  w-full
                  min-w-[600px]
                  text-left
                  text-sm
                "
              >
                <thead>
                  <tr
                    className="
                      border-b
                      border-slate-200
                      text-xs
                      uppercase
                      text-slate-400
                    "
                  >
                    <th className="py-3">
                      Fecha
                    </th>

                    <th>
                      Motivo
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
                  {
                    item
                      .detalles_horas_extra
                      .map(
                        (detalle) => (
                          <tr
                            key={detalle.id}
                            className="
                              border-b
                              border-slate-100
                            "
                          >
                            <td className="py-3">
                              {formatDate(
                                detalle.fecha,
                              )}
                            </td>

                            <td>
                              {
                                detalle.motivo_display
                              }
                            </td>

                            <td>
                              {
                                detalle.cantidad_horas
                              } hs
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
                      )
                  }
                </tbody>
              </table>
            </div>

            <div
              className="
                mt-3
                text-right
                font-bold
              "
            >
              Subtotal:{" "}
              {money(
                item.total_horas_extra,
              )}
            </div>
          </section>

          <div
            className="
              mt-8
              rounded-2xl
              bg-slate-900
              p-5
              text-white
              print:border
              print:border-slate-300
              print:bg-white
              print:text-black
            "
          >
            <p
              className="
                text-sm
                opacity-70
              "
            >
              Total liquidado
            </p>

            <p
              className="
                mt-1
                text-3xl
                font-bold
              "
            >
              {money(
                item.total,
              )}
            </p>
          </div>

          {item.observacion && (
            <div className="mt-6">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  text-slate-400
                "
              >
                Observación
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  text-slate-600
                "
              >
                {item.observacion}
              </p>
            </div>
          )}

          {item.estado === "ANULADA" && (
            <div
              className="
                mt-6
                rounded-2xl
                border
                border-red-200
                bg-red-50
                p-4
              "
            >
              <p
                className="
                  font-semibold
                  text-red-800
                "
              >
                Liquidación anulada
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  text-red-700
                "
              >
                {item.motivo_anulacion}
              </p>
            </div>
          )}

          <div
            className="
              mt-8
              border-t
              border-slate-200
              pt-5
            "
          >
            <DetailActions
              estado={item.estado}
              loading={loading}
              onAnular={anular}
            />
          </div>
        </article>
      </div>
    </main>
  );
}