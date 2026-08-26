import {
  useEffect,
  useState,
} from "react";

import {
  UserRound,
  X,
} from "lucide-react";

import {
  createValorAdministrador,
  updateValorAdministrador,
} from "./api";

import type {
  ValorAdministrador,
} from "./types";

import {
  getPeones,
} from "../peones/api";

import type {
  Peon,
} from "../peones/types";


interface Props {
  open: boolean;

  administrador:
    | ValorAdministrador
    | null;

  onClose: () => void;

  onSuccess: () => void;
}


export default function AdministradorModal({
  open,
  administrador,
  onClose,
  onSuccess,
}: Props) {

  const [
    peones,
    setPeones,
  ] = useState<Peon[]>([]);

  const [
    peon,
    setPeon,
  ] = useState("");

  const [
    cantidadJornales,
    setCantidadJornales,
  ] = useState("6");

  const [
    vigenteDesde,
    setVigenteDesde,
  ] = useState("");

  const [
    vigenteHasta,
    setVigenteHasta,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  const editando = Boolean(
    administrador
  );


  useEffect(() => {

    if (!open) {
      return;
    }

    async function cargarPeones() {

      try {

        const data =
          await getPeones();

        setPeones(
          Array.isArray(data)
            ? data.filter(
                (item) =>
                  item.activo
              )
            : []
        );

      } catch (err) {

        console.error(
          "Error cargando peones:",
          err
        );

      }

    }

    cargarPeones();

  }, [open]);


  useEffect(() => {

    if (!open) {
      return;
    }

    setError("");

    if (administrador) {

      setPeon(
        String(
          administrador.peon
        )
      );

      setCantidadJornales(
        String(
          administrador
            .cantidad_jornales
        )
      );

      setVigenteDesde(
        administrador
          .vigente_desde
      );

      setVigenteHasta(
        administrador
          .vigente_hasta
        ?? ""
      );

    } else {

      setPeon("");

      setCantidadJornales(
        "6"
      );

      setVigenteDesde("");

      setVigenteHasta("");

    }

  }, [
    open,
    administrador,
  ]);


  if (!open) {
    return null;
  }


  async function handleSubmit(
    event:
      React.FormEvent
  ) {

    event.preventDefault();

    setError("");

    if (!peon) {

      setError(
        "Seleccioná un administrador."
      );

      return;
    }

    if (!vigenteDesde) {

      setError(
        "Indicá la fecha desde."
      );

      return;
    }

    const cantidad =
      Number(
        cantidadJornales
      );

    if (
      !Number.isFinite(
        cantidad
      )
      ||
      cantidad <= 0
    ) {

      setError(
        "La cantidad de jornales debe ser mayor a cero."
      );

      return;
    }


    try {

      setSaving(true);

      const payload = {
        peon:
          Number(peon),

        cantidad_jornales:
          cantidad,

        vigente_desde:
          vigenteDesde,

        vigente_hasta:
          vigenteHasta
            ? vigenteHasta
            : null,
      };


      if (
        administrador
      ) {

        await updateValorAdministrador(
          administrador.id,
          payload
        );

      } else {

        await createValorAdministrador(
          payload
        );

      }


      onSuccess();

    } catch (err: any) {

      console.error(
        "Error guardando administrador:",
        err
      );

      const data =
        err?.response?.data;

      if (
        data?.vigente_desde
      ) {

        setError(
          Array.isArray(
            data.vigente_desde
          )
            ? data
                .vigente_desde[0]
            : String(
                data.vigente_desde
              )
        );

      } else if (
        data?.detail
      ) {

        setError(
          String(
            data.detail
          )
        );

      } else {

        setError(
          "No se pudo guardar la configuración."
        );

      }

    } finally {

      setSaving(false);

    }
  }


  return (
    <div className="
      fixed inset-0 z-50
      flex
      items-end
      justify-center
      bg-black/30
      p-0
      backdrop-blur-[2px]
      sm:items-center
      sm:p-4
    ">

      <div className="
        w-full
        max-w-lg
        rounded-t-[28px]
        bg-white
        shadow-2xl
        sm:rounded-[28px]
      ">

        {/* HEADER */}

        <div className="
          flex
          items-center
          justify-between
          border-b
          border-[#EEF1EF]
          px-5 py-4
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              flex h-10 w-10
              items-center
              justify-center
              rounded-2xl
              bg-[#EEF3EF]
              text-[#18392B]
            ">
              <UserRound
                size={19}
              />
            </div>

            <div>

              <h2 className="
                text-base
                font-semibold
                text-[#242925]
              ">
                {
                  editando
                    ? "Editar administrador"
                    : "Agregar administrador"
                }
              </h2>

              <p className="
                mt-0.5
                text-xs
                text-[#7B847E]
              ">
                Configuración mensual
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
              items-center
              justify-center
              rounded-xl
              text-[#87908A]
              transition
              hover:bg-[#F1F4F2]
            "
          >
            <X size={18} />
          </button>

        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="
            space-y-5
            px-5 py-5
          "
        >

          {/* PEON */}

          <div>

            <label className="
              mb-2 block
              text-xs
              font-semibold
              uppercase
              tracking-[0.08em]
              text-[#707A73]
            ">
              Administrador
            </label>

            <select
              value={peon}
              onChange={(e) =>
                setPeon(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-[#DDE3DF]
                bg-white
                px-4 py-3
                text-sm
                text-[#242925]
                outline-none
                transition
                focus:border-[#93A99C]
                focus:ring-4
                focus:ring-[#18392B]/5
              "
            >
              <option value="">
                Seleccionar peón
              </option>

              {peones.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.nombre}
                  </option>
                )
              )}

            </select>

          </div>


          {/* JORNALES */}

          <div>

            <label className="
              mb-2 block
              text-xs
              font-semibold
              uppercase
              tracking-[0.08em]
              text-[#707A73]
            ">
              Jornales mensuales
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={
                cantidadJornales
              }
              onChange={(e) =>
                setCantidadJornales(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-2xl
                border
                border-[#DDE3DF]
                bg-white
                px-4 py-3
                text-sm
                text-[#242925]
                outline-none
                transition
                focus:border-[#93A99C]
                focus:ring-4
                focus:ring-[#18392B]/5
              "
            />

            <p className="
              mt-2
              text-xs
              leading-5
              text-[#8A938D]
            ">
              Este valor se multiplica por
              el jornal vigente de cada mes.
            </p>

          </div>


          {/* FECHAS */}

          <div className="
            grid gap-4
            sm:grid-cols-2
          ">

            <div>

              <label className="
                mb-2 block
                text-xs
                font-semibold
                uppercase
                tracking-[0.08em]
                text-[#707A73]
              ">
                Vigente desde
              </label>

              <input
                type="date"
                value={
                  vigenteDesde
                }
                onChange={(e) =>
                  setVigenteDesde(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[#DDE3DF]
                  bg-white
                  px-4 py-3
                  text-sm
                  outline-none
                  focus:border-[#93A99C]
                  focus:ring-4
                  focus:ring-[#18392B]/5
                "
              />

            </div>


            <div>

              <label className="
                mb-2 block
                text-xs
                font-semibold
                uppercase
                tracking-[0.08em]
                text-[#707A73]
              ">
                Vigente hasta
              </label>

              <input
                type="date"
                value={
                  vigenteHasta
                }
                onChange={(e) =>
                  setVigenteHasta(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-[#DDE3DF]
                  bg-white
                  px-4 py-3
                  text-sm
                  outline-none
                  focus:border-[#93A99C]
                  focus:ring-4
                  focus:ring-[#18392B]/5
                "
              />

              <p className="
                mt-2
                text-xs
                text-[#8A938D]
              ">
                Opcional
              </p>

            </div>

          </div>


          {error && (

            <div className="
              rounded-2xl
              bg-red-50
              px-4 py-3
              text-sm
              text-red-700
            ">
              {error}
            </div>

          )}


          <div className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-[#EEF1EF]
            pt-4
            sm:flex-row
            sm:justify-end
          ">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-2xl
                border
                border-[#DDE3DF]
                px-4 py-3
                text-sm
                font-semibold
                text-[#59625C]
                transition
                hover:bg-[#F6F8F6]
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                rounded-2xl
                bg-[#18392B]
                px-5 py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#224C3A]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {
                saving
                  ? "Guardando..."
                  : "Guardar"
              }
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}