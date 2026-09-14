import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  CircleDollarSign,
  X,
} from "lucide-react";

import {
  createCambioMoneda,
  getCuentasSelector,
} from "../api";

import type {
  CuentaSelector,
  OperacionCambioMoneda,
} from "../types";


interface Props {
  open: boolean;

  onClose: () => void;

  onSuccess: () => void;
}


function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}


function getApiError(
  error: any
) {
  const data =
    error?.response?.data;

  if (!data) {
    return (
      "No se pudo registrar "
      + "el cambio de moneda."
    );
  }

  if (
    typeof data.detail ===
    "string"
  ) {
    return data.detail;
  }

  const first =
    Object.values(data)?.[0];

  if (
    Array.isArray(first)
  ) {
    return String(
      first[0]
    );
  }

  if (
    typeof first ===
    "string"
  ) {
    return first;
  }

  return (
    "No se pudo registrar "
    + "el cambio de moneda."
  );
}


function moneyARS(
  value:
    | string
    | number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value || 0)
  );
}


function moneyUSD(
  value:
    | string
    | number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value || 0)
  );
}


export default function CambioMonedaModal({
  open,
  onClose,
  onSuccess,
}: Props) {

  const [
    operacion,
    setOperacion,
  ] =
    useState<OperacionCambioMoneda>(
      "COMPRAR_USD"
    );

  const [
    fecha,
    setFecha,
  ] =
    useState(
      today()
    );

  const [
    monto,
    setMonto,
  ] =
    useState("");

  const [
    cotizacion,
    setCotizacion,
  ] =
    useState("");

  const [
    descripcion,
    setDescripcion,
  ] =
    useState(
      "Compra de dólares"
    );

  const [
    observacion,
    setObservacion,
  ] =
    useState("");

  const [
    cuentaOrigen,
    setCuentaOrigen,
  ] =
    useState("");

  const [
    cuentaDestino,
    setCuentaDestino,
  ] =
    useState("");

  const [
    cuentas,
    setCuentas,
  ] = useState<
    CuentaSelector[]
  >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    loadingData,
    setLoadingData,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  useEffect(() => {

    if (!open) {
      return;
    }

    setOperacion(
      "COMPRAR_USD"
    );

    setFecha(
      today()
    );

    setMonto("");

    setCotizacion("");

    setDescripcion(
      "Compra de dólares"
    );

    setObservacion("");

    setCuentaOrigen("");

    setCuentaDestino("");

    setError("");

    loadCuentas();

  }, [
    open,
  ]);


  async function loadCuentas() {

    try {

      setLoadingData(
        true
      );

      const data =
        await getCuentasSelector();

      setCuentas(
        data
      );

    } catch (error) {

      console.error(
        error
      );

      setError(
        "No se pudieron cargar las cuentas."
      );

    } finally {

      setLoadingData(
        false
      );

    }
  }


  function changeOperacion(
    value:
      OperacionCambioMoneda
  ) {

    setOperacion(
      value
    );

    setMonto("");

    setCuentaOrigen("");

    setCuentaDestino("");

    setError("");

    setDescripcion(
      value ===
      "COMPRAR_USD"
        ? "Compra de dólares"
        : "Compra de pesos"
    );
  }


  const cuentasOrigen =
    useMemo(() => {

      const moneda =
        operacion ===
        "COMPRAR_USD"
          ? "ARS"
          : "USD";

      return cuentas.filter(
        (item) =>
          item.moneda ===
          moneda
      );

    }, [
      cuentas,
      operacion,
    ]);


  const cuentasDestino =
    useMemo(() => {

      const moneda =
        operacion ===
        "COMPRAR_USD"
          ? "USD"
          : "ARS";

      return cuentas.filter(
        (item) =>
          item.moneda ===
          moneda
      );

    }, [
      cuentas,
      operacion,
    ]);


  const calculo =
    useMemo(() => {

      const montoNumber =
        Number(
          monto
        );

      const cotizacionNumber =
        Number(
          cotizacion
        );

      if (
        !montoNumber
        ||
        !cotizacionNumber
        ||
        montoNumber <= 0
        ||
        cotizacionNumber <= 0
      ) {

        return {
          origen: 0,
          destino: 0,
        };

      }

      if (
        operacion ===
        "COMPRAR_USD"
      ) {

        return {
          origen:
            montoNumber
            * cotizacionNumber,

          destino:
            montoNumber,
        };

      }

      return {
        origen:
          montoNumber
          / cotizacionNumber,

        destino:
          montoNumber,
      };

    }, [
      monto,
      cotizacion,
      operacion,
    ]);


  async function handleSubmit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    if (
      !monto ||
      Number(monto) <= 0
    ) {

      setError(
        "Ingresá un monto válido."
      );

      return;
    }

    if (
      !cotizacion ||
      Number(
        cotizacion
      ) <= 0
    ) {

      setError(
        "Ingresá una cotización válida."
      );

      return;
    }

    if (
      !descripcion.trim()
    ) {

      setError(
        "Ingresá una descripción."
      );

      return;
    }

    if (
      !cuentaOrigen
    ) {

      setError(
        "Seleccioná una cuenta origen."
      );

      return;
    }

    if (
      !cuentaDestino
    ) {

      setError(
        "Seleccioná una cuenta destino."
      );

      return;
    }

    try {

      setLoading(
        true
      );

      setError("");

      await createCambioMoneda({
        operacion,

        fecha,

        descripcion:
          descripcion.trim(),

        monto,

        cotizacion,

        cuenta_origen:
          Number(
            cuentaOrigen
          ),

        cuenta_destino:
          Number(
            cuentaDestino
          ),

        observacion:
          observacion.trim(),
      });

      onSuccess();

    } catch (error) {

      console.error(
        error
      );

      setError(
        getApiError(
          error
        )
      );

    } finally {

      setLoading(
        false
      );

    }
  }


  if (!open) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="max-h-[94%] w-full overflow-y-auto rounded-t-[30px] bg-white shadow-2xl sm:max-w-xl sm:rounded-[30px]">

        <div className="sticky top-0 z-20 flex items-start justify-between border-b border-[#EEF1EF] bg-white px-5 py-5 sm:px-6">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A938D]">
              Finanzas
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Cambiar moneda
            </h2>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7F5] text-[#7B847E]"
          >
            <X
              size={20}
            />
          </button>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="p-5 pb-8 sm:p-6"
        >

          <div className="grid grid-cols-2 gap-3">

            <TipoButton
              active={
                operacion ===
                "COMPRAR_USD"
              }
              onClick={() =>
                changeOperacion(
                  "COMPRAR_USD"
                )
              }
              icon={
                <CircleDollarSign
                  size={22}
                />
              }
              label="Comprar dólares"
            />

            <TipoButton
              active={
                operacion ===
                "COMPRAR_ARS"
              }
              onClick={() =>
                changeOperacion(
                  "COMPRAR_ARS"
                )
              }
              icon={
                <Banknote
                  size={22}
                />
              }
              label="Comprar pesos"
            />

          </div>


          {error && (

            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>

          )}


          <div className="mt-6">

            <Label>
              {operacion ===
              "COMPRAR_USD"
                ? "Dólares a comprar"
                : "Pesos a comprar"}
            </Label>

            <div className="flex h-16 items-center rounded-[20px] border border-[#DDE3DF] bg-[#FAFBFA] px-4 focus-within:border-[#9FB4A6]">

              <span className="mr-2 text-lg font-semibold text-[#8B948E]">
                {operacion ===
                "COMPRAR_USD"
                  ? "USD"
                  : "$"}
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={
                  monto
                }
                onChange={(event) =>
                  setMonto(
                    event.target.value
                  )
                }
                className="min-w-0 flex-1 bg-transparent text-2xl font-semibold outline-none"
                placeholder="0"
              />

            </div>

          </div>


          <Field>

            <Label>
              Importe por dólar
            </Label>

            <div className="flex h-13 items-center rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] px-4 focus-within:border-[#9FB4A6]">

              <span className="mr-2 font-semibold text-[#8B948E]">
                $
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={
                  cotizacion
                }
                onChange={(event) =>
                  setCotizacion(
                    event.target.value
                  )
                }
                className="min-w-0 flex-1 bg-transparent text-base outline-none"
                placeholder="0"
              />

            </div>

          </Field>


          {calculo.origen > 0 && (

            <div className="mt-5 rounded-[22px] border border-[#DCE5DF] bg-[#F2F6F3] p-4">

              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7A867E]">
                Resumen
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">

                <div>

                  <p className="text-[10px] uppercase text-[#9AA29D]">
                    Sale
                  </p>

                  <p className="mt-1 font-semibold text-red-600">

                    {operacion ===
                    "COMPRAR_USD"
                      ? moneyARS(
                          calculo.origen
                        )
                      : moneyUSD(
                          calculo.origen
                        )}

                  </p>

                </div>

                <div>

                  <p className="text-[10px] uppercase text-[#9AA29D]">
                    Entra
                  </p>

                  <p className="mt-1 font-semibold text-emerald-700">

                    {operacion ===
                    "COMPRAR_USD"
                      ? moneyUSD(
                          calculo.destino
                        )
                      : moneyARS(
                          calculo.destino
                        )}

                  </p>

                </div>

              </div>

            </div>

          )}


          <Field>

            <Label>
              Descripción
            </Label>

            <input
              type="text"
              maxLength={255}
              value={
                descripcion
              }
              onChange={(event) =>
                setDescripcion(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            />

          </Field>


          <Field>

            <Label>
              Fecha
            </Label>

            <input
              type="date"
              value={
                fecha
              }
              onChange={(event) =>
                setFecha(
                  event.target.value
                )
              }
              className={
                inputClass
              }
            />

          </Field>


          <Field>

            <Label>
              Cuenta origen
            </Label>

            <select
              value={
                cuentaOrigen
              }
              onChange={(event) =>
                setCuentaOrigen(
                  event.target.value
                )
              }
              className={
                inputClass
              }
              disabled={
                loadingData
              }
            >

              <option value="">
                Seleccionar cuenta
              </option>

              {cuentasOrigen.map(
                (item) => (

                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {item.nombre}
                    {" · "}
                    {item.moneda}
                  </option>

                )
              )}

            </select>

          </Field>


          <Field>

            <Label>
              Cuenta destino
            </Label>

            <select
              value={
                cuentaDestino
              }
              onChange={(event) =>
                setCuentaDestino(
                  event.target.value
                )
              }
              className={
                inputClass
              }
              disabled={
                loadingData
              }
            >

              <option value="">
                Seleccionar cuenta
              </option>

              {cuentasDestino.map(
                (item) => (

                  <option
                    key={
                      item.id
                    }
                    value={
                      item.id
                    }
                  >
                    {item.nombre}
                    {" · "}
                    {item.moneda}
                  </option>

                )
              )}

            </select>

          </Field>


          <Field>

            <Label>
              Observación
            </Label>

            <textarea
              rows={2}
              value={
                observacion
              }
              onChange={(event) =>
                setObservacion(
                  event.target.value
                )
              }
              maxLength={255}
              className={`${inputClass} h-auto py-3`}
              placeholder="Opcional"
            />

          </Field>


          <div className="mt-7 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
              className="h-13 rounded-2xl border border-[#DDE3DF] font-semibold text-[#59615C]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                loadingData
              }
              className="h-13 rounded-2xl bg-[#18392B] font-semibold text-white disabled:opacity-60"
            >
              {loading
                ? "Registrando..."
                : "Registrar cambio"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


const inputClass =
  "h-13 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] px-4 text-base text-[#333936] outline-none focus:border-[#9FB4A6] focus:bg-white";


function Field({
  children,
}: {
  children:
    React.ReactNode;
}) {

  return (
    <div className="mt-5">
      {children}
    </div>
  );
}


function Label({
  children,
}: {
  children:
    React.ReactNode;
}) {

  return (
    <label className="mb-2 block text-sm font-semibold text-[#414844]">
      {children}
    </label>
  );
}


function TipoButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;

  onClick: () => void;

  icon: React.ReactNode;

  label: string;
}) {

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex min-h-[82px] flex-col items-center justify-center rounded-2xl border px-2 text-center transition ${
        active
          ? "border-[#9EB1A4] bg-[#EEF4F0] text-[#18392B]"
          : "border-[#E2E7E3] text-[#68716B]"
      }`}
    >

      {icon}

      <span className="mt-2 text-xs font-semibold sm:text-sm">
        {label}
      </span>

    </button>
  );
}