import {
  useEffect,
  useState,
} from "react";

import {
  Landmark,
  X,
} from "lucide-react";

import {
  createCuenta,
  updateCuenta,
} from "../api";

import type {
  CuentaFinanciera,
  TipoCuenta,
} from "../types";


interface Props {
  open: boolean;

  cuenta?:
    | CuentaFinanciera
    | null;

  onClose: () => void;
  onSuccess: () => void;
}


export default function CuentaFormModal({
  open,
  cuenta,
  onClose,
  onSuccess,
}: Props) {

  const editing =
    Boolean(cuenta);

  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    tipo,
    setTipo,
  ] =
    useState<TipoCuenta>(
      "BILLETERA"
    );

  const [
    saldoInicial,
    setSaldoInicial,
  ] = useState("0");

  const [
    descripcion,
    setDescripcion,
  ] = useState("");

  const [
    activa,
    setActiva,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    if (!open) {
      return;
    }

    setNombre(
      cuenta?.nombre ?? ""
    );

    setTipo(
      cuenta?.tipo ??
        "BILLETERA"
    );

    setSaldoInicial(
      cuenta?.saldo_inicial ??
        "0"
    );

    setDescripcion(
      cuenta?.descripcion ??
        ""
    );

    setActiva(
      cuenta?.activa ??
        true
    );

    setError("");

  }, [
    open,
    cuenta,
  ]);


  async function submit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    if (!nombre.trim()) {
      setError(
        "Ingresá el nombre de la cuenta."
      );
      return;
    }

    try {

      setLoading(true);
      setError("");

      const payload = {
        nombre:
          nombre.trim(),

        tipo,

        saldo_inicial:
          saldoInicial || "0",

        descripcion:
          descripcion.trim(),

        activa,
      };

      if (cuenta) {

        await updateCuenta(
          cuenta.id,
          payload
        );

      } else {

        await createCuenta(
          payload
        );

      }

      onSuccess();

    } catch (error: any) {

      const data =
        error?.response?.data;

      setError(
        data?.nombre?.[0] ??
        "No se pudo guardar la cuenta."
      );

    } finally {

      setLoading(false);

    }
  }


  if (!open) {
    return null;
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 sm:items-center sm:p-4">

      <div className="w-full rounded-t-[28px] bg-white sm:max-w-lg sm:rounded-[28px]">

        <div className="flex items-start justify-between border-b border-[#EEF1EF] p-5 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF2ED] text-[#18392B]">
              <Landmark size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-[#89928C]">
                Finanzas
              </p>

              <h2 className="text-xl font-semibold">
                {editing
                  ? "Editar cuenta"
                  : "Nueva cuenta"}
              </h2>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F7F5]"
          >
            <X size={19} />
          </button>

        </div>


        <form
          onSubmit={submit}
          className="p-5 sm:p-6"
        >

          {error && (
            <ErrorBox>
              {error}
            </ErrorBox>
          )}


          <FormField label="Nombre">

            <input
              value={nombre}
              onChange={(event) =>
                setNombre(
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Ej. Naranja X"
            />

          </FormField>


          <FormField label="Tipo">

            <select
              value={tipo}
              onChange={(event) =>
                setTipo(
                  event.target
                    .value as TipoCuenta
                )
              }
              className={inputClass}
            >
              <option value="BANCO">
                Banco
              </option>

              <option value="BILLETERA">
                Billetera virtual
              </option>

              <option value="EFECTIVO">
                Efectivo
              </option>

              <option value="TARJETA">
                Tarjeta
              </option>

              <option value="OTRO">
                Otro
              </option>
            </select>

          </FormField>


          <FormField
            label="Saldo inicial"
          >

            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={
                saldoInicial
              }
              onChange={(event) =>
                setSaldoInicial(
                  event.target.value
                )
              }
              className={inputClass}
            />

          </FormField>


          <FormField
            label="Descripción"
          >

            <textarea
              rows={2}
              value={descripcion}
              onChange={(event) =>
                setDescripcion(
                  event.target.value
                )
              }
              className={`${inputClass} h-auto py-3`}
            />

          </FormField>


          <label className="mt-5 flex min-h-12 items-center gap-3 rounded-2xl bg-[#F6F8F6] px-4">

            <input
              type="checkbox"
              checked={activa}
              onChange={(event) =>
                setActiva(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />

            <span className="text-sm font-medium">
              Cuenta activa
            </span>

          </label>


          <div className="mt-7 grid grid-cols-2 gap-3">

            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-2xl border border-[#DDE3DF] font-semibold"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-2xl bg-[#18392B] font-semibold text-white disabled:opacity-60"
            >
              {loading
                ? "Guardando..."
                : "Guardar"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


const inputClass =
  "h-13 w-full rounded-2xl border border-[#DDE3DF] bg-[#FAFBFA] px-4 text-base outline-none focus:border-[#9FB4A6]";


function FormField({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {

  return (
    <div className="mt-5 first:mt-0">
      <label className="mb-2 block text-sm font-semibold text-[#414844]">
        {label}
      </label>

      {children}
    </div>
  );
}


function ErrorBox({
  children,
}: {
  children:
    React.ReactNode;
}) {

  return (
    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {children}
    </div>
  );
}