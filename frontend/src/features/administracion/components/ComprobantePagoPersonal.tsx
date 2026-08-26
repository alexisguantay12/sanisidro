import {
  useMemo,
} from "react";

import type {
  LiquidacionPersonal,
} from "../types";

import {
  formatDate,
  money,
} from "../utils";

import "./comprobantePagoPersonal.css";


interface Props {
  liquidacion: LiquidacionPersonal;
}


interface GrupoJornal {
  valor: number;
  cantidad: number;
  subtotal: number;
}


function numero(
  value: string | number,
) {
  return Number(
    value || 0,
  );
}


function cantidad(
  value: number,
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    value,
  );
}


function nombreMes(
  mes: number,
) {
  const meses = [
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    meses[mes]
    ?? ""
  );
}


function SanIsidroLogo() {
  return (
    <div className="si-logo">

      <svg
        viewBox="0 0 110 70"
        aria-hidden="true"
      >

        {/* CEBOLLA */}

        <g
          fill="none"
          stroke="#b38b45"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >

          <path
            d="
              M30 17
              C30 23 19 25 19 39
              C19 52 26 59 36 59
              C46 59 53 52 53 39
              C53 25 42 23 42 17
            "
          />

          <path
            d="M36 17 C32 11 34 7 38 3"
          />

          <path
            d="M30 25 C25 35 26 47 31 56"
          />

          <path
            d="M42 25 C47 35 46 47 41 56"
          />

          <path
            d="M36 23 L36 58"
          />

        </g>


        {/* PIMIENTO */}

        <g
          transform="translate(55 4)"
          stroke="#185c3d"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >

          <path
            d="
              M22 18
              C10 15 5 24 7 37
              C8 51 13 59 21 59
              C25 59 27 56 29 54
              C31 56 34 59 38 59
              C46 59 51 51 52 37
              C54 24 47 15 36 18
              C31 20 27 20 22 18
              Z
            "
            fill="#dceadd"
          />

          <path
            d="
              M28 18
              C27 10 30 5 38 5
            "
            fill="none"
          />

          <path
            d="
              M28 19
              C25 27 25 43 28 55
            "
            fill="none"
            opacity=".7"
          />

          <path
            d="
              M35 19
              C38 29 38 43 35 56
            "
            fill="none"
            opacity=".7"
          />

        </g>

      </svg>


      <div>
        <div className="si-logo-name">
          SAN ISIDRO
        </div>
      </div>

    </div>
  );
}


export default function ComprobantePagoPersonal({
  liquidacion,
}: Props) {

  // =========================================================
  // TOTAL DE JORNALES
  // =========================================================

  const cantidadJornales =
    useMemo(
      () =>
        liquidacion
          .detalles_tarjas
          .reduce(
            (
              total,
              item,
            ) =>
              total
              +
              numero(
                item.fraccion,
              ),
            0,
          ),
      [
        liquidacion
          .detalles_tarjas,
      ],
    );


  // =========================================================
  // AGRUPAR JORNALES POR VALOR
  // =========================================================

  const gruposJornales =
    useMemo<
      GrupoJornal[]
    >(
      () => {

        const grupos =
          new Map<
            number,
            GrupoJornal
          >();


        for (
          const item
          of liquidacion
            .detalles_tarjas
        ) {

          const valor =
            numero(
              item
                .valor_jornal_aplicado,
            );

          const fraccion =
            numero(
              item.fraccion,
            );

          const importe =
            numero(
              item.importe,
            );


          const actual =
            grupos.get(
              valor,
            );


          if (
            actual
          ) {

            actual.cantidad +=
              fraccion;

            actual.subtotal +=
              importe;

          } else {

            grupos.set(
              valor,
              {
                valor,
                cantidad:
                  fraccion,
                subtotal:
                  importe,
              },
            );

          }

        }


        return Array.from(
          grupos.values(),
        );

      },
      [
        liquidacion
          .detalles_tarjas,
      ],
    );


  // =========================================================
  // TOTAL HORAS
  // =========================================================

  const cantidadHoras =
    useMemo(
      () =>
        liquidacion
          .detalles_horas_extra
          .reduce(
            (
              total,
              item,
            ) =>
              total
              +
              numero(
                item
                  .cantidad_horas,
              ),
            0,
          ),
      [
        liquidacion
          .detalles_horas_extra,
      ],
    );


  // =========================================================
  // EXISTENCIA DE SECCIONES
  // =========================================================

  const tieneHoras =
    liquidacion
      .detalles_horas_extra
      .length > 0;


  const tieneAdministracion =
    (
      liquidacion
        .detalles_administracion
      ?? []
    ).length > 0;


  const tieneDescuentos =
    (
      liquidacion
        .detalles_tarjas_externas
      ?? []
    ).length > 0;


  // =========================================================
  // NUMERACION DINAMICA
  // =========================================================

  let numeroSeccion = 2;

  const numeroHoras =
    tieneHoras
      ? numeroSeccion++
      : null;

  const numeroAdministracion =
    tieneAdministracion
      ? numeroSeccion++
      : null;

  const numeroDescuentos =
    tieneDescuentos
      ? numeroSeccion++
      : null;


  const anulada =
    liquidacion.estado
    === "ANULADA";


  return (
    <article
      id="comprobante-pago-personal"
      className="si-comprobante"
    >

      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <header className="si-header">

        <SanIsidroLogo />


        <div className="si-header-center">

          <h1>
            PAGOS DE JORNALES
          </h1>

          <p>
            Comprobante N°{" "}
            {liquidacion.id}
          </p>

        </div>


        <div className="si-header-right">

          <span
            className={
              anulada
                ? "si-status si-status-anulada"
                : "si-status si-status-activa"
            }
          >
            {anulada
              ? "ANULADA"
              : "ACTIVA"}
          </span>


          <div className="si-payment-date">

            <span>
              Fecha de pago
            </span>

            <strong>
              {formatDate(
                liquidacion
                  .fecha_pago,
              )}
            </strong>

          </div>

        </div>

      </header>


      {/* =====================================================
          COLABORADOR
      ===================================================== */}

      <section className="si-person">

        <div className="si-person-main">

          <div className="si-avatar">

            {liquidacion
              .peon_nombre
              .slice(
                0,
                1,
              )
              .toUpperCase()}

          </div>


          <div>

            <span className="si-label">
              Colaborador
            </span>

            <strong>
              {
                liquidacion
                  .peon_nombre
              }
            </strong>

          </div>

        </div>


        <div>

          <span className="si-label">
            Período
          </span>

          <strong>

            {formatDate(
              liquidacion
                .fecha_desde,
            )}

            {" al "}

            {formatDate(
              liquidacion
                .fecha_hasta,
            )}

          </strong>

        </div>


        {liquidacion
          .cuenta_financiera_nombre && (

          <div>

            <span className="si-label">
              Cuenta de pago
            </span>

            <strong>
              {
                liquidacion
                  .cuenta_financiera_nombre
              }
            </strong>

          </div>

        )}

      </section>


      {/* =====================================================
          JORNALES
      ===================================================== */}

      <section className="si-section">

        <div className="si-section-title si-green">
          1. Jornales
        </div>


        <table className="si-table">

          <thead>

            <tr>

              <th>
                Fecha
              </th>

              <th>
                Jornal
              </th>

              <th>
                Tarea
              </th>

              <th className="right">
                Valor unitario
              </th>

              <th className="right">
                Importe
              </th>

            </tr>

          </thead>


          <tbody>

            {liquidacion
              .detalles_tarjas
              .map(
                (item) => (

                  <tr
                    key={
                      item.id
                    }
                  >

                    <td>
                      {formatDate(
                        item.fecha,
                      )}
                    </td>


                    <td>

                      {
                        Number(
                          item.fraccion,
                        ) === 1
                          ? "Día completo"
                          : "Medio día"
                      }

                    </td>


                    <td>

                      {
                        item
                          .tarea_display
                        ||
                        "-"
                      }

                    </td>


                    <td className="right">

                      {money(
                        item
                          .valor_jornal_aplicado,
                      )}

                    </td>


                    <td className="right strong">

                      {money(
                        item.importe,
                      )}

                    </td>

                  </tr>

                ),
              )}

          </tbody>

        </table>


        {/* ===================================================
            RESUMEN JORNALES
        =================================================== */}

        <div className="si-jornal-summary">

          <div>

            <span>
              Total de jornales
            </span>

            <strong>
              {cantidad(
                cantidadJornales,
              )}
            </strong>

          </div>


          {
            gruposJornales.length === 1
              ? (

                <div>

                  <span>
                    Valor unitario
                  </span>

                  <strong>
                    {money(
                      gruposJornales[
                        0
                      ].valor,
                    )}
                  </strong>

                </div>

              )
              : (

                <div className="si-multi-values">

                  <span>
                    Valores aplicados
                  </span>


                  {gruposJornales.map(
                    (grupo) => (

                      <small
                        key={
                          grupo.valor
                        }
                      >

                        {cantidad(
                          grupo.cantidad,
                        )}

                        {" × "}

                        {money(
                          grupo.valor,
                        )}

                      </small>

                    ),
                  )}

                </div>

              )
          }


          <div className="si-summary-highlight">

            <span>
              Subtotal jornales
            </span>

            <strong>

              {money(
                liquidacion
                  .total_tarjas,
              )}

            </strong>

          </div>

        </div>


        {gruposJornales.length > 1 && (

          <div className="si-jornal-breakdown">

            {gruposJornales.map(
              (grupo) => (

                <div
                  key={
                    grupo.valor
                  }
                >

                  <span>

                    {cantidad(
                      grupo.cantidad,
                    )}

                    {" jornales × "}

                    {money(
                      grupo.valor,
                    )}

                  </span>


                  <strong>

                    {money(
                      grupo.subtotal,
                    )}

                  </strong>

                </div>

              ),
            )}

          </div>

        )}

      </section>


      {/* =====================================================
          HORAS EXTRA
      ===================================================== */}

      {tieneHoras && (

        <section
          className="
            si-section
            si-small-section
          "
        >

          <div className="si-section-title si-sand">
            {numeroHoras}. Horas extra
          </div>


          <table className="si-table">

            <thead>

              <tr>

                <th>
                  Fecha
                </th>

                <th>
                  Motivo
                </th>

                <th>
                  Cantidad
                </th>

                <th className="right">
                  Valor hora
                </th>

                <th className="right">
                  Importe
                </th>

              </tr>

            </thead>


            <tbody>

              {liquidacion
                .detalles_horas_extra
                .map(
                  (item) => (

                    <tr
                      key={
                        item.id
                      }
                    >

                      <td>
                        {formatDate(
                          item.fecha,
                        )}
                      </td>


                      <td>
                        {
                          item
                            .motivo_display
                        }
                      </td>


                      <td>
                        {
                          item
                            .cantidad_horas
                        } hs
                      </td>


                      <td className="right">

                        {money(
                          item
                            .valor_hora,
                        )}

                      </td>


                      <td className="right strong">

                        {money(
                          item
                            .importe,
                        )}

                      </td>

                    </tr>

                  ),
                )}

            </tbody>

          </table>


          <div className="si-section-footer">

            <span>

              Total horas:{" "}

              <strong>
                {cantidad(
                  cantidadHoras,
                )}
              </strong>

            </span>


            <span>
              Subtotal horas extra
            </span>


            <strong>

              {money(
                liquidacion
                  .total_horas_extra,
              )}

            </strong>

          </div>

        </section>

      )}


      {/* =====================================================
          ADMINISTRACION
      ===================================================== */}

      {tieneAdministracion && (

        <section
          className="
            si-section
            si-small-section
          "
        >

          <div className="si-section-title si-green">

            {numeroAdministracion}.
            {" "}
            Administración

          </div>


          <p className="si-section-note">

            Compensación mensual
            correspondiente al rol
            de administrador.

          </p>


          <table className="si-table">

            <thead>

              <tr>

                <th>
                  Período
                </th>

                <th className="right">
                  Jornales
                </th>

                <th className="right">
                  Valor jornal
                </th>

                <th className="right">
                  Importe
                </th>

              </tr>

            </thead>


            <tbody>

              {(
                liquidacion
                  .detalles_administracion
                ?? []
              ).map(
                (item) => (

                  <tr
                    key={
                      item.id
                    }
                  >

                    <td className="strong">

                      Administración{" "}

                      {nombreMes(
                        item.mes,
                      )}

                      {" "}

                      {item.anio}

                    </td>


                    <td className="right">

                      {cantidad(
                        numero(
                          item
                            .cantidad_jornales,
                        ),
                      )}

                    </td>


                    <td className="right">

                      {money(
                        item
                          .valor_jornal_aplicado,
                      )}

                    </td>


                    <td className="right strong">

                      {money(
                        item
                          .importe,
                      )}

                    </td>

                  </tr>

                ),
              )}

            </tbody>

          </table>


          <div className="si-section-footer">

            <span>
              Subtotal administración
            </span>


            <strong>

              {money(
                liquidacion
                  .total_administracion,
              )}

            </strong>

          </div>

        </section>

      )}


      {/* =====================================================
          DESCUENTOS
      ===================================================== */}

      {tieneDescuentos && (

        <section
          className="
            si-section
            si-small-section
          "
        >

          <div className="si-section-title si-red">

            {numeroDescuentos}.
            {" "}
            Descuentos

          </div>


          <p className="si-section-note">

            Jornales realizados por otros
            colaboradores para{" "}

            {
              liquidacion
                .peon_nombre
            }.

          </p>


          <table className="si-table si-discount-table">

            <thead>

              <tr>

                <th>
                  Fecha
                </th>

                <th>
                  Colaborador que trabajó
                </th>

                <th>
                  Jornal
                </th>

                <th className="right">
                  Valor unitario
                </th>

                <th className="right">
                  Importe
                </th>

              </tr>

            </thead>


            <tbody>

              {liquidacion
                .detalles_tarjas_externas
                .map(
                  (item) => (

                    <tr
                      key={
                        item.id
                      }
                    >

                      <td>

                        {formatDate(
                          item.fecha,
                        )}

                      </td>


                      <td className="strong">

                        {
                          item
                            .peon_origen_nombre
                        }

                      </td>


                      <td>

                        {
                          Number(
                            item.fraccion,
                          ) === 1
                            ? "Día completo"
                            : "Medio día"
                        }

                      </td>


                      <td className="right">

                        {money(
                          item
                            .valor_jornal_aplicado,
                        )}

                      </td>


                      <td className="right si-negative">

                        -

                        {money(
                          item.importe,
                        )}

                      </td>

                    </tr>

                  ),
                )}

            </tbody>

          </table>


          <div className="si-discount-total">

            <span>
              Total descuentos
            </span>


            <strong>

              -

              {money(
                liquidacion
                  .total_descuentos,
              )}

            </strong>

          </div>

        </section>

      )}


      {/* =====================================================
          OBSERVACION
      ===================================================== */}

      {liquidacion.observacion && (

        <section className="si-observation">

          <span>
            Observación
          </span>

          <p>

            {
              liquidacion
                .observacion
            }

          </p>

        </section>

      )}


      {/* =====================================================
          TOTAL FINAL
      ===================================================== */}

      <section className="si-total-final">

        <div>

          <span>
            TOTAL PAGADO AL COLABORADOR
          </span>

          <small>
            Pago correspondiente
            al período indicado.
          </small>

        </div>


        <strong>

          {money(
            liquidacion.total,
          )}

        </strong>

      </section>


      <footer className="si-footer">

        <span>
          San Isidro
        </span>


        <span>

          Comprobante N°{" "}

          {liquidacion.id}

        </span>


        <span>

          Fecha de emisión:{" "}

          {formatDate(
            liquidacion
              .fecha_pago,
          )}

        </span>

      </footer>

    </article>
  );
}