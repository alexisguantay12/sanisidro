import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  X,
} from "lucide-react";

import {
  createValorJornal,
  updateValorJornal,
} from "./api";

import type {
  ValorJornal,
} from "./types";


interface Props {
  open: boolean;

  valorJornal?:
    | ValorJornal
    | null;

  onClose: () => void;

  onSuccess: () => void;
}


function today() {
  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );
}


function getErrorMessage(
  error: any
) {

  const data =
    error?.response?.data;

  if (!data) {
    return (
      "No se pudo guardar el valor."
    );
  }

  if (
    typeof data.detail ===
    "string"
  ) {
    return data.detail;
  }

  if (
    Array.isArray(
      data.vigente_desde
    )
  ) {
    return (
      data.vigente_desde[0]
    );
  }

  if (
    Array.isArray(
      data.vigente_hasta
    )
  ) {
    return (
      data.vigente_hasta[0]
    );
  }

  if (
    Array.isArray(
      data.valor
    )
  ) {
    return data.valor[0];
  }

  if (
    Array.isArray(
      data.non_field_errors
    )
  ) {
    return (
      data.non_field_errors[0]
    );
  }

  return (
    "No se pudo guardar el valor."
  );
}


export default function ValorJornalModal({
  open,
  valorJornal,
  onClose,
  onSuccess,
}: Props) {

  const [
    valor,
    setValor,
  ] = useState("");


  const [
    vigenteDesde,
    setVigenteDesde,
  ] = useState(
    today()
  );


  const [
    vigenteHasta,
    setVigenteHasta,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const editando =
    Boolean(
      valorJornal
    );


  useEffect(() => {

    if (!open) {
      return;
    }

    if (
      valorJornal
    ) {

      setValor(
        String(
          valorJornal.valor
        )
      );

      setVigenteDesde(
        valorJornal
          .vigente_desde
      );

      setVigenteHasta(
        valorJornal
          .vigente_hasta ??
        ""
      );

    } else {

      setValor("");

      setVigenteDesde(
        today()
      );

      setVigenteHasta(
        ""
      );
    }

    setError("");

  }, [
    open,
    valorJornal,
  ]);


  if (!open) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent
  ) {

    event.preventDefault();


    const numero =
      Number(
        valor
      );


    if (
      !Number.isFinite(
        numero
      )
      ||
      numero <= 0
    ) {

      setError(
        "El valor debe ser mayor a cero."
      );

      return;
    }


    if (
      vigenteHasta
      &&
      vigenteHasta <
      vigenteDesde
    ) {

      setError(
        "La fecha hasta no puede ser anterior a la fecha desde."
      );

      return;
    }


    try {

      setLoading(true);

      setError("");


      const payload = {
        valor:
          numero,

        vigente_desde:
          vigenteDesde,

        vigente_hasta:
          vigenteHasta ||
          null,
      };


      if (
        valorJornal
      ) {

        await updateValorJornal(
          valorJornal.id,
          payload
        );

      } else {

        await createValorJornal(
          payload
        );
      }


      onClose();

      await onSuccess();

    } catch (
      error: any
    ) {

      console.error(
        error
      );

      setError(
        getErrorMessage(
          error
        )
      );

    } finally {

      setLoading(false);
    }
  }


  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">

      <div className="flex max-h-[90dvh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">

        <div className="flex items-start justify-between border-b border-black/5 px-5 py-5">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Configuración · Valores
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">

              {editando
                ? "Editar valor de jornal"
                : "Nuevo valor de jornal"}

            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#747D77] hover:bg-[#F3F5F3]"
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
          className="flex min-h-0 flex-1 flex-col"
        >

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}


            <div>

              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Valor
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={valor}
                onChange={(
                  e
                ) =>
                  setValor(
                    e.target
                      .value
                  )
                }
                placeholder="35000"
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Vigente desde
              </label>

              <input
                type="date"
                required
                value={
                  vigenteDesde
                }
                onChange={(
                  e
                ) =>
                  setVigenteDesde(
                    e.target
                      .value
                  )
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Vigente hasta
              </label>

              <input
                type="date"
                value={
                  vigenteHasta
                }
                onChange={(
                  e
                ) =>
                  setVigenteHasta(
                    e.target
                      .value
                  )
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />

              <p className="mt-2 text-xs leading-5 text-[#8B948E]">
                Dejalo vacío si
                este valor debe
                continuar vigente
                hasta la actualidad.
              </p>

            </div>


            <div className="flex gap-3 rounded-2xl bg-[#F3F6F4] p-4">

              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#60766A]">
                <CalendarDays
                  size={16}
                />
              </div>

              <p className="text-sm leading-6 text-[#68716B]">

                {editando
                  ? (
                      "Podés corregir el valor y su período de vigencia. No se permiten períodos superpuestos."
                    )
                  : (
                      "Si ya existe un jornal vigente sin fecha hasta, al crear uno nuevo el sistema cerrará automáticamente el período anterior."
                    )}

              </p>

            </div>

          </div>


          <div className="border-t border-black/5 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-5">

            <div className="flex gap-3">

              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C]"
              >
                Cancelar
              </button>


              <button
                type="submit"
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white disabled:opacity-60"
              >

                {loading
                  ? "Guardando..."
                  : editando
                    ? "Guardar cambios"
                    : "Guardar"}

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}