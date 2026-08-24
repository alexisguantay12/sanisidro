import {
  useEffect,
  useState,
} from "react";

import {
  Tags,
  X,
} from "lucide-react";

import {
  createCategoria,
  getGrupos,
  updateCategoria,
} from "../api";

import type {
  CategoriaFinanciera,
  GrupoFinanciero,
} from "../types";


interface Props {
  open: boolean;

  categoria?:
    | CategoriaFinanciera
    | null;

  onClose: () => void;
  onSuccess: () => void;
}


export default function CategoriaFormModal({
  open,
  categoria,
  onClose,
  onSuccess,
}: Props) {

  const [
    grupos,
    setGrupos,
  ] =
    useState<
      GrupoFinanciero[]
    >([]);

  const [
    grupo,
    setGrupo,
  ] =
    useState("");

  const [
    nombre,
    setNombre,
  ] =
    useState("");

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

    setGrupo(
      categoria
        ? String(
            categoria.grupo
          )
        : ""
    );

    setNombre(
      categoria?.nombre ??
        ""
    );

    setDescripcion(
      categoria?.descripcion ??
        ""
    );

    setActivo(
      categoria?.activo ??
        true
    );

    setError("");

    loadGrupos();

  }, [
    open,
    categoria,
  ]);


  async function loadGrupos() {

    const data =
      await getGrupos({
        activo: true,
      });

    setGrupos(data);
  }


  async function submit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    if (!grupo) {
      setError(
        "Seleccioná un grupo."
      );
      return;
    }

    try {

      setLoading(true);
      setError("");

      const payload = {
        grupo:
          Number(grupo),

        nombre:
          nombre.trim(),

        descripcion:
          descripcion.trim(),

        activo,
      };

      if (categoria) {

        await updateCategoria(
          categoria.id,
          payload
        );

      } else {

        await createCategoria(
          payload
        );

      }

      onSuccess();

    } catch (error: any) {

      setError(
        error?.response
          ?.data
          ?.nombre?.[0] ??
        "No se pudo guardar la categoría."
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

        <div className="flex items-center justify-between border-b border-[#EEF1EF] p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F1EDF4] text-[#685371]">
              <Tags size={20} />
            </div>

            <h2 className="text-xl font-semibold">
              {categoria
                ? "Editar categoría"
                : "Nueva categoría"}
            </h2>

          </div>

          <button
            onClick={onClose}
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


          <Field label="Grupo">

            <select
              value={grupo}
              onChange={(event) =>
                setGrupo(
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                Seleccionar grupo
              </option>

              {grupos.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nombre}
                    {" · "}
                    {item.tipo_display}
                  </option>
                )
              )}
            </select>

          </Field>


          <Field label="Nombre">

            <input
              value={nombre}
              onChange={(event) =>
                setNombre(
                  event.target.value
                )
              }
              className={inputClass}
              placeholder="Ej. Combustible"
            />

          </Field>


          <Field
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

          </Field>


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

            Categoría activa

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


function Field({
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