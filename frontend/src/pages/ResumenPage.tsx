import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRightLeft,
  CalendarDays,
  Clock3,
  RefreshCw,
  Shovel,
  Sprout,
  Tractor,
  TrendingUp,
  Users,
  Wheat,
} from "lucide-react";

import {
  getResumenOperativo,
} from "../features/resumen/api";

import type {
  ResumenOperativo,
} from "../features/resumen/types";


function number(
  value:
    | string
    | number
    | null
    | undefined
) {
  return Number(
    value ?? 0
  );
}


function decimal(
  value:
    | string
    | number
    | null
    | undefined
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  ).format(
    number(value)
  );
}


function fechaInput(
  value: Date
) {
  const year =
    value.getFullYear();

  const month =
    String(
      value.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      value.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function fechaDisplay(
  value: string
) {
  if (!value) {
    return "-";
  }

  const [
    year,
    month,
    day,
  ] = value.split("-");

  return `${day}/${month}/${year}`;
}


type MetricTone =
  | "green"
  | "blue"
  | "olive"
  | "orange"
  | "mint"
  | "earth"
  | "terracotta"
  | "violet";


interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  icon: React.ElementType;
  tone: MetricTone;
}


const metricStyles: Record<
  MetricTone,
  {
    card: string;
    icon: string;
    label: string;
    value: string;
  }
> = {

  green: {
    card:
      "border-[#CFE5D7] bg-[#EFF8F2]",
    icon:
      "bg-[#DCEFE3] text-[#1E6443]",
    label:
      "text-[#587466]",
    value:
      "text-[#173F2C]",
  },

  blue: {
    card:
      "border-[#D4E4F2] bg-[#F1F7FC]",
    icon:
      "bg-[#DFEDF8] text-[#376D96]",
    label:
      "text-[#61788B]",
    value:
      "text-[#244C69]",
  },

  olive: {
    card:
      "border-[#DAE3C7] bg-[#F5F8EC]",
    icon:
      "bg-[#E5ECD2] text-[#60773D]",
    label:
      "text-[#778267]",
    value:
      "text-[#465B2C]",
  },

  orange: {
    card:
      "border-[#F0DECA] bg-[#FFF8F0]",
    icon:
      "bg-[#F8E8D5] text-[#A5662C]",
    label:
      "text-[#92745B]",
    value:
      "text-[#74471F]",
  },

  mint: {
    card:
      "border-[#D3EADB] bg-[#F0FAF3]",
    icon:
      "bg-[#DCF2E4] text-[#34724C]",
    label:
      "text-[#628271]",
    value:
      "text-[#245738]",
  },

  earth: {
    card:
      "border-[#E8DECD] bg-[#FBF7F0]",
    icon:
      "bg-[#F0E7D8] text-[#826846]",
    label:
      "text-[#897967]",
    value:
      "text-[#5D4932]",
  },

  terracotta: {
    card:
      "border-[#EDD7CF] bg-[#FFF5F1]",
    icon:
      "bg-[#F5E1D9] text-[#A65D42]",
    label:
      "text-[#927064]",
    value:
      "text-[#783F2D]",
  },

  violet: {
    card:
      "border-[#E2DCEF] bg-[#F8F5FC]",
    icon:
      "bg-[#EBE4F5] text-[#72589A]",
    label:
      "text-[#7D718D]",
    value:
      "text-[#58436F]",
  },
};


function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: MetricCardProps) {

  const styles =
    metricStyles[
      tone
    ];


  return (
    <div
      className={`
        relative overflow-hidden
        rounded-[24px]
        border
        p-4
        shadow-[0_8px_28px_rgba(27,30,28,0.035)]
        transition
        hover:-translate-y-0.5
        hover:shadow-[0_12px_32px_rgba(27,30,28,0.07)]
        sm:p-5
        ${styles.card}
      `}
    >

      <div
        className={`
          flex h-10 w-10
          items-center justify-center
          rounded-2xl
          ${styles.icon}
        `}
      >

        <Icon
          size={19}
        />

      </div>


      <p
        className={`
          mt-4
          text-[11px]
          font-semibold
          uppercase
          tracking-[0.11em]
          sm:text-xs
          ${styles.label}
        `}
      >
        {label}
      </p>


      <p
        className={`
          mt-1.5
          text-2xl
          font-semibold
          tracking-tight
          sm:text-3xl
          ${styles.value}
        `}
      >
        {value}
      </p>


      {detail && (

        <p className="mt-1.5 text-xs leading-5 text-[#7D877F]">
          {detail}
        </p>

      )}


      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/35" />

    </div>
  );
}


export default function ResumenPage() {

  const [
    data,
    setData,
  ] = useState<
    ResumenOperativo | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    modo,
    setModo,
  ] = useState<
    "campania" | "mes"
  >(
    "campania"
  );


  const [
    mesSeleccionado,
    setMesSeleccionado,
  ] = useState(
    "2026-08"
  );


  async function loadData() {

    try {

      setLoading(
        true
      );

      setError("");


      if (
        modo ===
        "campania"
      ) {

        const response =
          await getResumenOperativo();

        setData(
          response
        );

        return;
      }


      const [
        year,
        month,
      ] = mesSeleccionado
        .split("-")
        .map(Number);


      const fechaDesde =
        new Date(
          year,
          month - 1,
          1
        );


      const fechaHasta =
        new Date(
          year,
          month,
          0
        );


      const response =
        await getResumenOperativo(
          {
            fecha_desde:
              fechaInput(
                fechaDesde
              ),

            fecha_hasta:
              fechaInput(
                fechaHasta
              ),
          }
        );


      setData(
        response
      );

    } catch (
      error
    ) {

      console.error(
        error
      );

      setError(
        "No se pudo cargar el resumen operativo."
      );

    } finally {

      setLoading(
        false
      );

    }
  }


  useEffect(
    () => {

      void loadData();

    },
    [
      modo,
      mesSeleccionado,
    ]
  );


  const maxJornalesMes =
    useMemo(
      () => {

        if (
          !data
          ||
          data
            .jornales_por_mes
            .length === 0
        ) {
          return 1;
        }

        return Math.max(
          ...data
            .jornales_por_mes
            .map(
              item =>
                number(
                  item.jornales
                )
            ),
          1
        );

      },
      [
        data,
      ]
    );


  const maxTarea =
    useMemo(
      () => {

        if (
          !data
          ||
          data
            .por_tarea
            .length === 0
        ) {
          return 1;
        }

        return Math.max(
          ...data
            .por_tarea
            .map(
              item =>
                number(
                  item.jornales
                )
            ),
          1
        );

      },
      [
        data,
      ]
    );


  const tareaColors = [
    "bg-[#357A58]",
    "bg-[#669B71]",
    "bg-[#88A860]",
    "bg-[#5E8E9C]",
    "bg-[#C38A4B]",
    "bg-[#A8664E]",
    "bg-[#7A8F67]",
    "bg-[#8A739A]",
  ];


  if (
    loading
    &&
    !data
  ) {

    return (
      <div className="min-h-full bg-[#F5F8F5] px-4 py-10">

        <div className="mx-auto flex max-w-6xl items-center justify-center rounded-[28px] border border-[#E4E8E5] bg-white py-16">

          <div className="flex items-center gap-3 text-sm font-semibold text-[#667069]">

            <RefreshCw
              size={18}
              className="animate-spin"
            />

            Cargando resumen...

          </div>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-full bg-[#F5F8F5]">

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">

        {/* HEADER */}

        <div className="rounded-[28px] border border-[#DFE8E1] bg-gradient-to-br from-[#F2F8F3] to-[#FAFCFA] p-5 sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#668174]">
                Campaña
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#18392B] sm:text-3xl">
                Resumen operativo
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#728078]">
                Una vista rápida de la
                actividad y el trabajo
                realizado en San Isidro.
              </p>


              {data && (

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-[#6D7B73]">

                  <CalendarDays
                    size={14}
                  />

                  <span>

                    {fechaDisplay(
                      data
                        .periodo
                        .fecha_desde
                    )}

                    {" al "}

                    {fechaDisplay(
                      data
                        .periodo
                        .fecha_hasta
                    )}

                  </span>

                </div>

              )}

            </div>


            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

              <div className="flex rounded-2xl border border-[#D8E1DA] bg-white/90 p-1 shadow-sm">

                <button
                  type="button"
                  onClick={() =>
                    setModo(
                      "campania"
                    )
                  }
                  className={`h-10 flex-1 rounded-xl px-4 text-sm font-semibold transition sm:flex-none ${
                    modo ===
                    "campania"
                      ? "bg-[#18392B] text-white shadow-sm"
                      : "text-[#68716B] hover:bg-[#F4F7F4]"
                  }`}
                >
                  Campaña
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setModo(
                      "mes"
                    )
                  }
                  className={`h-10 flex-1 rounded-xl px-4 text-sm font-semibold transition sm:flex-none ${
                    modo ===
                    "mes"
                      ? "bg-[#18392B] text-white shadow-sm"
                      : "text-[#68716B] hover:bg-[#F4F7F4]"
                  }`}
                >
                  Mes
                </button>

              </div>


              {modo ===
                "mes" && (

                <input
                  type="month"
                  value={
                    mesSeleccionado
                  }
                  min="2026-07"
                  max="2027-07"
                  onChange={
                    (
                      event
                    ) =>
                      setMesSeleccionado(
                        event
                          .target
                          .value
                      )
                  }
                  className="h-12 w-full rounded-2xl border border-[#D8E1DA] bg-white px-4 text-sm font-semibold text-[#444B47] outline-none focus:border-[#8EAE9A] focus:ring-4 focus:ring-[#18392B]/5 sm:w-auto"
                />

              )}

            </div>

          </div>

        </div>


        {error && (

          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>

        )}


        {data && (

          <>

            {/* MÉTRICAS */}

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">

              <MetricCard
                label="Jornales San Isidro"
                value={
                  decimal(
                    data
                      .resumen
                      .jornales_san_isidro
                  )
                }
                detail="Trabajo realizado para San Isidro"
                icon={Users}
                tone="green"
              />


              <MetricCard
                label="Horas extra"
                value={`${decimal(
                  data
                    .resumen
                    .horas_extra
                )} h`}
                detail="Horas adicionales del personal"
                icon={Clock3}
                tone="blue"
              />


              <MetricCard
                label="Tractor Sergio"
                value={`${decimal(
                  data
                    .resumen
                    .horas_tractor_sergio
                )} h`}
                detail="Horas utilizadas"
                icon={Tractor}
                tone="olive"
              />


              <MetricCard
                label="Tractor terceros"
                value={`${decimal(
                  data
                    .resumen
                    .horas_tractor_terceros
                )} h`}
                detail="Horas contratadas"
                icon={Tractor}
                tone="orange"
              />


              <MetricCard
                label="Almácigos"
                value={
                  decimal(
                    data
                      .resumen
                      .cantidad_almacigos
                  )
                }
                detail="Cantidad acumulada"
                icon={Sprout}
                tone="mint"
              />


              <MetricCard
                label="Mula"
                value={
                  decimal(
                    data
                      .resumen
                      .jornales_mula
                  )
                }
                detail={`${data.resumen.registros_mula} registros`}
                icon={Wheat}
                tone="earth"
              />


              <MetricCard
                label="Paleadas"
                value={
                  decimal(
                    data
                      .resumen
                      .paleadas
                  )
                }
                detail="Jornales realizados para San Isidro"
                icon={Shovel}
                tone="terracotta"
              />


              <MetricCard
                label="Colaboradores"
                value={
                  String(
                    data
                      .colaboradores
                      .length
                  )
                }
                detail="Con actividad en el período"
                icon={Users}
                tone="violet"
              />

            </div>


            {/* GRÁFICOS */}

            <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_1fr]">

              {/* JORNALES POR MES */}

              <div className="rounded-[26px] border border-[#DDE7DF] bg-white p-5 shadow-[0_8px_28px_rgba(27,30,28,0.04)] sm:p-6">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-base font-semibold text-[#263A30]">
                      Jornales San Isidro por mes
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#859089]">
                      Evolución del trabajo
                      registrado durante la
                      campaña.
                    </p>

                  </div>


                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E5F1E8] text-[#35684A]">

                    <TrendingUp
                      size={19}
                    />

                  </div>

                </div>


                {data
                  .jornales_por_mes
                  .length === 0 ? (

                  <div className="py-12 text-center text-sm text-[#8B948E]">
                    No hay jornales registrados.
                  </div>

                ) : (

                  <div className="mt-7 space-y-5">

                    {data
                      .jornales_por_mes
                      .map(
                        item => {

                          const porcentaje =
                            Math.max(
                              3,
                              (
                                number(
                                  item.jornales
                                )
                                /
                                maxJornalesMes
                              )
                              * 100
                            );


                          return (

                            <div
                              key={`${item.anio}-${item.mes}`}
                              className="grid grid-cols-[72px_1fr_auto] items-center gap-3 sm:grid-cols-[100px_1fr_auto]"
                            >

                              <p className="truncate text-xs font-semibold text-[#596C61] sm:text-sm">
                                {item.mes_nombre}
                              </p>


                              <div className="h-3.5 overflow-hidden rounded-full bg-[#EAF0EB]">

                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#4E8A68] to-[#286044]"
                                  style={{
                                    width:
                                      `${porcentaje}%`,
                                  }}
                                />

                              </div>


                              <p className="min-w-[48px] text-right text-sm font-semibold text-[#263A30]">
                                {decimal(
                                  item.jornales
                                )}
                              </p>

                            </div>

                          );
                        }
                      )}

                  </div>

                )}

              </div>


              {/* TAREAS */}

              <div className="rounded-[26px] border border-[#E7E1D7] bg-[#FFFDF9] p-5 shadow-[0_8px_28px_rgba(27,30,28,0.04)] sm:p-6">

                <div>

                  <p className="text-base font-semibold text-[#3D392F]">
                    Actividad por tarea
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#948C7E]">
                    Distribución de jornales
                    trabajados para San Isidro.
                  </p>

                </div>


                {data
                  .por_tarea
                  .length === 0 ? (

                  <div className="py-12 text-center text-sm text-[#958E83]">
                    No hay tareas registradas.
                  </div>

                ) : (

                  <div className="mt-7 space-y-5">

                    {data
                      .por_tarea
                      .slice(
                        0,
                        8
                      )
                      .map(
                        (
                          item,
                          index
                        ) => {

                          const porcentaje =
                            Math.max(
                              4,
                              (
                                number(
                                  item.jornales
                                )
                                /
                                maxTarea
                              )
                              * 100
                            );


                          const barColor =
                            tareaColors[
                              index %
                              tareaColors.length
                            ];


                          return (

                            <div
                              key={
                                item.tarea
                              }
                            >

                              <div className="mb-2 flex items-end justify-between gap-3">

                                <div>

                                  <p className="text-sm font-semibold text-[#4B443A]">
                                    {item.nombre}
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-[#A0988D]">
                                    {item.registros} registros
                                  </p>

                                </div>


                                <p className="text-sm font-semibold text-[#363229]">
                                  {decimal(
                                    item.jornales
                                  )}
                                </p>

                              </div>


                              <div className="h-2.5 overflow-hidden rounded-full bg-[#EEECE6]">

                                <div
                                  className={`h-full rounded-full ${barColor}`}
                                  style={{
                                    width:
                                      `${porcentaje}%`,
                                  }}
                                />

                              </div>

                            </div>

                          );
                        }
                      )}

                  </div>

                )}

              </div>

            </div>


            {/* COLABORADORES */}

            <div className="mt-6 overflow-hidden rounded-[26px] border border-[#E1E6E3] bg-white shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

              <div className="border-b border-[#E8ECE9] bg-gradient-to-r from-[#F7FAF8] to-white px-5 py-5 sm:px-6">

                <p className="text-base font-semibold text-[#303A34]">
                  Actividad por colaborador
                </p>

                <p className="mt-1 text-xs leading-5 text-[#8B948E]">
                  Jornales San Isidro,
                  trabajos externos,
                  jornales a compensar
                  y horas extra.
                </p>

              </div>


              {data
                .colaboradores
                .length === 0 ? (

                <div className="px-5 py-12 text-center text-sm text-[#8B948E]">
                  No hay colaboradores con
                  actividad en este período.
                </div>

              ) : (

                <div className="divide-y divide-[#EEF1EF]">

                  {data
                    .colaboradores
                    .map(
                      item => (

                        <div
                          key={
                            item.peon
                          }
                          className="px-5 py-5 sm:px-6"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F1EA] text-sm font-semibold text-[#356549]">

                                {item
                                  .nombre
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>


                              <div className="min-w-0">

                                <p className="truncate text-base font-semibold text-[#303633]">
                                  {item.nombre}
                                </p>

                                <p className="mt-0.5 text-xs text-[#8B948E]">
                                  Actividad del período
                                </p>

                              </div>

                            </div>


                            <div className="shrink-0 rounded-xl bg-[#EAF4ED] px-3 py-1.5 text-sm font-semibold text-[#285A3E]">

                              {decimal(
                                item
                                  .jornales_san_isidro
                              )}

                              {" j"}

                            </div>

                          </div>


                          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">

                            <div className="rounded-2xl border border-[#DCEBDD] bg-[#F1F8F3] p-3">

                              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#668173] sm:text-[11px]">
                                San Isidro
                              </p>

                              <p className="mt-1 text-base font-semibold text-[#28533C]">
                                {decimal(
                                  item
                                    .jornales_san_isidro
                                )}
                              </p>

                            </div>


                            <div className="rounded-2xl border border-[#DCE6EF] bg-[#F3F8FB] p-3">

                              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6E8291] sm:text-[11px]">
                                Externos
                              </p>

                              <p className="mt-1 text-base font-semibold text-[#385D73]">
                                {decimal(
                                  item
                                    .jornales_externos_realizados
                                )}
                              </p>

                            </div>


                            <div className="rounded-2xl border border-[#F0DEBF] bg-[#FFF8EA] p-3">

                              <div className="flex items-center gap-1.5 text-[#A16D24]">

                                <ArrowRightLeft
                                  size={13}
                                />

                                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-[11px]">
                                  A compensar
                                </p>

                              </div>

                              <p className="mt-1 text-base font-semibold text-[#79501B]">
                                {decimal(
                                  item
                                    .jornales_a_compensar
                                )}
                              </p>

                            </div>


                            <div className="rounded-2xl border border-[#D9E6F1] bg-[#F2F7FC] p-3">

                              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#70879A] sm:text-[11px]">
                                Horas extra
                              </p>

                              <p className="mt-1 text-base font-semibold text-[#365C79]">

                                {decimal(
                                  item
                                    .horas_extra
                                )}

                                {" h"}

                              </p>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                </div>

              )}

            </div>

          </>

        )}

      </div>

    </div>
  );
}