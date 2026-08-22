import {
  Ban,
  Printer,
} from "lucide-react";

import {
  useState,
} from "react";


interface Props {
  estado: "ACTIVA" | "ANULADA";

  loading?: boolean;

  onAnular: (
    motivo: string,
  ) => Promise<void>;
}


export default function DetailActions({
  estado,
  loading = false,
  onAnular,
}: Props) {
  const [
    showAnular,
    setShowAnular,
  ] = useState(false);

  const [
    motivo,
    setMotivo,
  ] = useState("");


  async function confirmar() {
    if (!motivo.trim()) {
      return;
    }

    await onAnular(
      motivo.trim(),
    );

    setShowAnular(false);
    setMotivo("");
  }


  return (
    <>
      <div
        className="
          flex
          flex-col
          gap-2
          sm:flex-row
          print:hidden
        "
      >
        <button
          type="button"
          onClick={() =>
            window.print()
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-300
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-700
            hover:bg-slate-50
          "
        >
          <Printer size={18} />

          Imprimir
        </button>

        {estado === "ACTIVA" && (
          <button
            type="button"
            onClick={() =>
              setShowAnular(true)
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-50
              px-4
              py-2.5
              text-sm
              font-semibold
              text-red-700
              hover:bg-red-100
            "
          >
            <Ban size={18} />

            Anular
          </button>
        )}
      </div>

      {showAnular && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-end
            justify-center
            bg-black/40
            p-4
            sm:items-center
          "
        >
          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              bg-white
              p-5
              shadow-2xl
            "
          >
            <h2
              className="
                text-lg
                font-bold
                text-slate-900
              "
            >
              Anular registro
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-500
              "
            >
              Los movimientos incluidos
              volverán a quedar pendientes.
              Esta operación quedará
              registrada.
            </p>

            <label
              className="
                mt-4
                block
              "
            >
              <span
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-slate-700
                "
              >
                Motivo
              </span>

              <textarea
                rows={3}
                value={motivo}
                onChange={(e) =>
                  setMotivo(
                    e.target.value,
                  )
                }
                placeholder="Indicá el motivo de la anulación..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-300
                  px-3
                  py-3
                  outline-none
                  focus:border-red-400
                "
              />
            </label>

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setShowAnular(false)
                }
                className="
                  rounded-xl
                  border
                  border-slate-300
                  px-4
                  py-3
                  font-semibold
                  text-slate-700
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={
                  loading
                  ||
                  !motivo.trim()
                }
                onClick={confirmar}
                className="
                  rounded-xl
                  bg-red-600
                  px-4
                  py-3
                  font-semibold
                  text-white
                  disabled:opacity-50
                "
              >
                Confirmar anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}