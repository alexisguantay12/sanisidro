import {
  useEffect,
  useState,
} from "react";

import {
  FolderTree,
  X,
} from "lucide-react";

import {
  createGrupo,
  updateGrupo,
} from "../api";

import type {
  GrupoFinanciero,
  TipoGrupo,
} from "../types";


interface Props {
  open: boolean;

  grupo?:
    | GrupoFinanciero
    | null;

  onClose: () => void;
  onSuccess: () => void;
}


export default function GrupoFormModal({
  open,
  grupo,
  onClose,
  onSuccess,
}: Props) {

  const [
    nombre,
    setNombre,
  ] =
    useState("");

  const [
    tipo,
    setTipo,
  ] =
    useState<TipoGrupo>(
      "EGRESO"
    );

  const [
    descripcion,
    setDescripcion,
  ] =
    useState("");

  const [
    activo,
    setActivo,
  ] =
    useState(true);

  const [
    loading,
    setLoading,
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

    setNombre(
      grupo?.nombre ?? ""
    );

    setTipo(
      grupo?.tipo ??
        "EGRESO"
    );

    setDescripcion(
      grupo?.descripcion ??
        ""
    );

    setActivo(
      grupo?.activo ??
        true
    );

    setError("");

  }, [
    open,
    grupo,
  ]);


  async function submit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    try {

      setLoading(true);
      setError("");

      const payload = {
        nombre:
          nombre.trim(),

        tipo,

        descripcion:
          descripcion.trim(),

        activo,
      };

      if (grupo) {

        await updateGrupo(
          grupo.id,
          payload
        );

      } else {

        await createGrupo(
          payload
        );

      }

      onSuccess();

    } catch (error: any) {

      setError(
        error?.response
          ?.data
          ?.nombre?.[0] ??
        "No se pudo guardar el grupo."
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

        <div className="flex items-center justify-between border-b border-[#EEF1EF] p-5 sm:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5EFE9] text-[#745942]">
              <FolderTree
                size={21}
              />
            </div>

            <h2 className="text-xl font-semibold">
              {grupo
                ? "Editar grupo"
                : "Nuevo grupo"}
            </h2>

          </div>

          <button
            onClick={onClose}
            className="h-10 w-10"
          >
            <X size={20} />
          </button>

        </div>


        <form
          onSubmit={submit}
          className="p-5 sm:p-6"
        >

          {error && (
            <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
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
              placeholder="Ej. Auto"
            />

          </FormField>


          <FormField label="Tipo">

            <select
              value={tipo}
              onChange={(event) =>
                setTipo(
                  event.target
                    .value as TipoGrupo
                )
              }
              className={inputClass}
            >
              <option value="INGRESO">
                Ingreso
              </option>

              <option value="EGRESO">
                Egreso
              </option>

              <option value="MIXTO">
                Mixto
              </option>
            </select>

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
              checked={activo}
              onChange={(event) =>
                setActivo(
                  event.target.checked
                )
              }
              className="h-5 w-5"
            />

            Grupo activo

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
              className="h-12 rounded-2xl bg-[#18392B] font-semibold text-white"
            >
              Guardar
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

      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      {children}

    </div>
  );
}