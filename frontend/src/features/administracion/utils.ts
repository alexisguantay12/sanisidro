export function money(
  value: string | number,
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    },
  ).format(Number(value));
}


export function formatDate(
  value: string,
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


export function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


export function firstDayOfMonth() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  return `${year}-${month}-01`;
}