import type {
  TarjaLocal,
} from "./types";


interface Props {
  year: number;

  month: number;

  registros: Record<
    string,
    TarjaLocal
  >;

  onDayClick: (
    fecha: string
  ) => void;
}


const weekdays = [
  "L",
  "M",
  "X",
  "J",
  "V",
  "S",
  "D",
];


function formatDate(
  year: number,
  month: number,
  day: number
) {
  const mm = String(
    month + 1
  ).padStart(
    2,
    "0"
  );

  const dd = String(
    day
  ).padStart(
    2,
    "0"
  );

  return `${year}-${mm}-${dd}`;
}


export default function TarjaCalendar({
  year,
  month,
  registros,
  onDayClick,
}: Props) {

  const firstDay =
    new Date(
      year,
      month,
      1
    );


  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  let startOffset =
    firstDay.getDay() - 1;


  if (
    startOffset < 0
  ) {
    startOffset = 6;
  }


  const cells: Array<
    number | null
  > = [];


  for (
    let i = 0;
    i < startOffset;
    i++
  ) {
    cells.push(null);
  }


  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push(day);
  }


  return (
    <div className="rounded-[24px] border border-[#E2E7E3] bg-white p-3 shadow-[0_3px_18px_rgba(20,30,24,0.04)] sm:p-5">

      {/* DÍAS DE LA SEMANA */}

      <div className="mb-2 grid grid-cols-7">

        {weekdays.map(
          (day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-bold uppercase text-[#909992]"
            >
              {day}
            </div>
          )
        )}

      </div>


      {/* CALENDARIO */}

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">

        {cells.map(
          (
            day,
            index
          ) => {

            if (!day) {
              return (
                <div
                  key={
                    `empty-${index}`
                  }
                  className="aspect-square"
                />
              );
            }


            const fecha =
              formatDate(
                year,
                month,
                day
              );


            const registro =
              registros[fecha];


            const liquidada =
              registro?.liquidada ===
              true;


            const completo =
              registro?.fraccion ===
              "1.0";


            const medio =
              registro?.fraccion ===
              "0.5";


            const externo =
              registro?.destino ===
              "externo";


            let title:
              string | undefined;


            if (
              liquidada &&
              externo &&
              registro
                ?.destinatario_nombre
            ) {

              title =
                (
                  "Tarja liquidada. " +
                  `Trabajo externo para ${registro.destinatario_nombre}.`
                );

            } else if (
              liquidada
            ) {

              title =
                (
                  "Tarja liquidada. " +
                  "No puede modificarse."
                );

            } else if (
              externo &&
              registro
                ?.destinatario_nombre
            ) {

              title =
                (
                  "Trabajo externo para " +
                  registro
                    .destinatario_nombre
                );

            } else if (
              externo
            ) {

              title =
                "Trabajo externo";
            }


            return (
              <button
                key={fecha}

                type="button"

                onClick={() =>
                  onDayClick(
                    fecha
                  )
                }

                title={title}

                className={`
                  relative
                  aspect-square
                  overflow-hidden
                  rounded-xl
                  text-sm
                  font-semibold
                  transition

                  ${
                    liquidada

                      ? (
                          "cursor-default " +
                          "border border-blue-500 " +
                          "bg-blue-500 " +
                          "text-white " +
                          "shadow-sm"
                        )

                      : completo

                        ? (
                            "bg-[#18392B] " +
                            "text-white " +
                            "shadow-sm " +
                            "hover:bg-[#204A38] " +
                            "active:scale-95"
                          )

                        : medio

                          ? (
                              "border " +
                              "border-amber-300 " +
                              "bg-amber-50 " +
                              "text-amber-900 " +
                              "hover:bg-amber-100 " +
                              "active:scale-95"
                            )

                          : (
                              "bg-[#F7F8F6] " +
                              "text-[#505752] " +
                              "hover:bg-[#EDF0ED] " +
                              "active:scale-95"
                            )
                  }
                `}
              >

                {/* NÚMERO DEL DÍA */}

                <span
                  className="
                    relative
                    z-10
                  "
                >
                  {day}
                </span>


                {/* INDICADOR DE JORNADA */}

                {(
                  completo ||
                  medio
                ) && (
                  <span
                    className={`
                      absolute
                      bottom-1.5
                      left-1/2
                      z-10
                      h-1
                      w-1
                      -translate-x-1/2
                      rounded-full

                      ${
                        liquidada

                          ? "bg-white/80"

                          : completo

                            ? "bg-white/70"

                            : "bg-amber-500"
                      }
                    `}
                  />
                )}


                {/* BANDERITA / TRIÁNGULO EXTERNO */}

                {externo && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      right-0
                      top-0
                      z-20
                      h-0
                      w-0
                      border-l-[17px]
                      border-l-transparent
                      border-t-[17px]
                      border-t-rose-400
                    "
                  />
                )}


                {/* MARCA DE LIQUIDADA */}

                {liquidada && (
                  <span
                    className="
                      pointer-events-none
                      absolute
                      left-1.5
                      top-1.5
                      z-20
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-white/90
                    "
                  />
                )}

              </button>
            );
          }
        )}

      </div>

    </div>
  );
}