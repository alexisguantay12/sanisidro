import type { TarjaLocal } from "./types";


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
  ).padStart(2, "0");

  const dd = String(day)
    .padStart(2, "0");

  return `${year}-${mm}-${dd}`;
}


export default function TarjaCalendar({
  year,
  month,
  registros,
  onDayClick,
}: Props) {

  const firstDay =
    new Date(year, month, 1);

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();


  let startOffset =
    firstDay.getDay() - 1;

  if (startOffset < 0) {
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

      <div className="mb-2 grid grid-cols-7">

        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[11px] font-bold uppercase text-[#909992]"
          >
            {day}
          </div>
        ))}

      </div>


      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">

        {cells.map(
          (day, index) => {

            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="aspect-square"
                />
              );
            }

            const fecha = formatDate(
              year,
              month,
              day
            );

            const registro =
              registros[fecha];

            const completo =
              registro?.fraccion === "1.0";

            const medio =
              registro?.fraccion === "0.5";


            return (
              <button
                key={fecha}
                type="button"
                onClick={() =>
                  onDayClick(fecha)
                }
                className={`
                  relative aspect-square
                  rounded-xl
                  text-sm font-semibold
                  transition
                  active:scale-95

                  ${
                    completo
                      ? "bg-[#18392B] text-white shadow-sm"
                      : medio
                      ? "border border-amber-300 bg-amber-50 text-amber-900"
                      : "bg-[#F7F8F6] text-[#505752] hover:bg-[#EDF0ED]"
                  }
                `}
              >

                {day}

                {(completo || medio) && (
                  <span
                    className={`
                      absolute bottom-1.5 left-1/2
                      h-1 w-1
                      -translate-x-1/2
                      rounded-full
                      ${
                        completo
                          ? "bg-white/70"
                          : "bg-amber-500"
                      }
                    `}
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