import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  X,
} from "lucide-react";

import {
  createMovimiento,
  getCategoriasSelector,
  getCuentasSelector,
  updateMovimiento,
} from "../api";

import type {
  CategoriaSelector,
  CuentaSelector,
  MovimientoFinanciero,
  TipoMovimiento,
} from "../types";


interface Props {
  open: boolean;

  movimiento?:
    | MovimientoFinanciero
    | null;

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
    return "No se pudo guardar el movimiento.";
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
    data.detail ??
    "No se pudo guardar el movimiento."
  );
}


export default function MovimientoFormModal({
  open,
  movimiento,
  onClose,
  onSuccess,
}: Props) {

  const editing =
    Boolean(movimiento);


  const [
    tipo,
    setTipo,
  ] =
    useState<TipoMovimiento>(
      "GASTO"
    );

  const [
    fecha,
    setFecha,
  ] =
    useState(today());

  const [
    descripcion,
    setDescripcion,
  ] =
    useState("");

  const [
    monto,
    setMonto,
  ] =
    useState("");

  const [
    categoria,
    setCategoria,
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
    observacion,
    setObservacion,
  ] =
    useState("");

  const [
    categorias,
    setCategorias,
  ] = useState<
    CategoriaSelector[]
  >([]);


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

    if (movimiento) {

      setTipo(
        movimiento.tipo
      );

      setFecha(
        movimiento.fecha
      );

      setDescripcion(
        movimiento.descripcion
      );

      setMonto(
        movimiento.monto
      );

      setCategoria(
        movimiento.categoria
          ? String(
              movimiento.categoria
            )
          : ""
      );

      setCuentaOrigen(
        movimiento.cuenta_origen
          ? String(
              movimiento.cuenta_origen
            )
          : ""
      );

      setCuentaDestino(
        movimiento.cuenta_destino
          ? String(
              movimiento.cuenta_destino
            )
          : ""
      );

      setObservacion(
        movimiento.observacion ??
          ""
      );

    } else {

      setTipo("GASTO");
      setFecha(today());
      setDescripcion("");
      setMonto("");
      setCategoria("");
      setCuentaOrigen("");
      setCuentaDestino("");
      setObservacion("");

    }

    setError("");

    loadCuentas();

  }, [
    open,
    movimiento,
  ]);


useEffect(() => {

  if (!open) {
    return;
  }

  if (
    tipo === "TRANSFERENCIA" ||
    tipo === "CAMBIO_MONEDA"
  ) {

    setCategorias([]);

    if (!editing) {
      setCategoria("");
    }

    return;
  }

  loadCategorias(
    tipo
  );

}, [
  tipo,
  open,
  editing,
]);


  async function loadCuentas() {

    try {

      setLoadingData(true);

      const data =
        await getCuentasSelector();

      setCuentas(data);

    } catch (error) {

      console.error(error);

      setError(
        "No se pudieron cargar las cuentas."
      );

    } finally {

      setLoadingData(false);

    }
  }

  async function loadCategorias(
    currentTipo:
      | "INGRESO"
      | "GASTO"
  ) {

    try {

      const data =
        await getCategoriasSelector(
          currentTipo
        );

      setCategorias(data);

    } catch (error) {

      console.error(error);

    }
  }


  function changeTipo(
    value: TipoMovimiento
  ) {

    setTipo(value);

    setCategoria("");
    setCuentaOrigen("");
    setCuentaDestino("");
    setError("");
  }


  async function handleSubmit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    if (
      !descripcion.trim()
    ) {

      setError(
        "Ingresá una descripción."
      );

      return;
    }

    if (
      !monto ||
      Number(monto) <= 0
    ) {

      setError(
        "Ingresá un monto válido."
      );

      return;
    }

    try {

      setLoading(true);
      setError("");

      const payload = {
        fecha,

        descripcion:
          descripcion.trim(),

        tipo,

        monto,

        categoria:
          tipo ===
          "TRANSFERENCIA"
            ? null
            : categoria
              ? Number(
                  categoria
                )
              : null,

        cuenta_origen:
          tipo === "INGRESO"
            ? null
            : cuentaOrigen
              ? Number(
                  cuentaOrigen
                )
              : null,

        cuenta_destino:
          tipo === "GASTO"
            ? null
            : cuentaDestino
              ? Number(
                  cuentaDestino
                )
              : null,

        observacion:
          observacion.trim(),
      };

      if (
        movimiento
      ) {

        await updateMovimiento(
          movimiento.id,
          payload
        );

      } else {

        await createMovimiento(
          payload
        );

      }

      onSuccess();

    } catch (error) {

      console.error(error);

      setError(
        getApiError(error)
      );

    } finally {

      setLoading(false);

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
              {editing
                ? "Editar movimiento"
                : "Nuevo movimiento"}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5F7F5] text-[#7B847E]"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="p-5 pb-8 sm:p-6"
        >

          <div className="grid grid-cols-3 gap-2">

            <TipoButton
              active={
                tipo === "GASTO"
              }
              onClick={() =>
                changeTipo(
                  "GASTO"
                )
              }
              icon={
                <ArrowUpRight
                  size={20}
                />
              }
              label="Gasto"
            />

            <TipoButton
              active={
                tipo === "INGRESO"
              }
              onClick={() =>
                changeTipo(
                  "INGRESO"
                )
              }
              icon={
                <ArrowDownLeft
                  size={20}
                />
              }
              label="Ingreso"
            />

            <TipoButton
              active={
                tipo ===
                "TRANSFERENCIA"
              }
              onClick={() =>
                changeTipo(
                  "TRANSFERENCIA"
                )
              }
              icon={
                <ArrowRightLeft
                  size={20}
                />
              }
              label="Transferencia"
            />

          </div>


          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          <div className="mt-6">

            <Label>
              Monto
            </Label>

            <div className="flex h-16 items-center rounded-[20px] border border-[#DDE3DF] bg-[#FAFBFA] px-4 focus-within:border-[#9FB4A6]">

              <span className="mr-2 text-xl font-semibold text-[#8B948E]">
                $
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={monto}
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
              className={inputClass}
              placeholder="Descripción"
            />
          </Field>


          <Field>
            <Label>
              Fecha
            </Label>

            <input
              type="date"
              value={fecha}
              onChange={(event) =>
                setFecha(
                  event.target.value
                )
              }
              className={inputClass}
            />
          </Field>


          {tipo !==
            "TRANSFERENCIA" && (

            <Field>

              <Label>
                Categoría
              </Label>

              <select
                value={categoria}
                onChange={(event) =>
                  setCategoria(
                    event.target.value
                  )
                }
                className={inputClass}
              >

                <option value="">
                  Seleccionar categoría
                </option>

                {categorias.map(
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
                      {item.grupo_nombre}
                    </option>
                  )
                )}

              </select>

            </Field>
          )}


          {tipo !==
            "INGRESO" && (

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
                className={inputClass}
              >

                <option value="">
                  Seleccionar cuenta
                </option>

                {cuentas.map(
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
                    </option>
                  )
                )}

              </select>

            </Field>
          )}


          {tipo !==
            "GASTO" && (

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
                className={inputClass}
              >

                <option value="">
                  Seleccionar cuenta
                </option>

                {cuentas
                  .filter(
                    (item) =>
                      String(
                        item.id
                      ) !==
                      cuentaOrigen
                  )
                  .map(
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
                      </option>
                    )
                  )}

              </select>

            </Field>
          )}


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
            />

          </Field>


          <div className="mt-7 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
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
                ? "Guardando..."
                : editing
                  ? "Guardar cambios"
                  : "Registrar"}
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
      onClick={onClick}
      className={`flex min-h-[76px] flex-col items-center justify-center rounded-2xl border px-2 text-center transition ${
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