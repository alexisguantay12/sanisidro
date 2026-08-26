import {
  useEffect,
  useState,
} from "react";

import {
  BadgeDollarSign,
  CalendarDays,
  Edit3,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import FinanzasBackButton
  from "../finanzas/FinanzasBackButton";

import {
  deleteValorAdministrador,
  getValoresAdministrador,
} from "./api";

import type {
  ValorAdministrador,
} from "./types";

import AdministradorModal from "./AdministradorModal";

function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "Actualidad";
  }

  return new Intl.DateTimeFormat(
    "es-AR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(
    new Date(
      `${value}T00:00:00Z`
    )
  );
}


export default function AdministradorPage() {

  const [
    registros,
    setRegistros,
  ] = useState<
    ValorAdministrador[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    seleccionado,
    setSeleccionado,
  ] = useState<
    ValorAdministrador | null
  >(null);


  async function cargar() {
    try {

      setLoading(true);

      const data =
        await getValoresAdministrador();

      setRegistros(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Error cargando administrador:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    cargar();
  }, []);


  function handleNuevo() {

    setSeleccionado(null);

    setModalOpen(true);
  }


  function handleEditar(
    item: ValorAdministrador
  ) {

    setSeleccionado(item);

    setModalOpen(true);
  }


  async function handleEliminar(
    item: ValorAdministrador
  ) {

    const confirmar =
      window.confirm(
        `¿Eliminar la configuración de ${item.peon_nombre}?`
      );

    if (!confirmar) {
      return;
    }

    try {

      await deleteValorAdministrador(
        item.id
      );

      await cargar();

    } catch (error) {

      console.error(
        "Error eliminando administrador:",
        error
      );

      alert(
        "No se pudo eliminar la configuración."
      );
    }
  }


  return (
    <div className="min-h-full bg-[#F6F8F6]">

      <div className="
        mx-auto
        max-w-6xl
        px-4 py-5
        sm:px-6 sm:py-7
        lg:px-8
      ">

        <FinanzasBackButton />

        {/* ===========================================
            HEADER
        =========================================== */}

        <div className="
          mt-5
          flex flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        ">

          <div>

            <div className="
              flex h-11 w-11
              items-center
              justify-center
              rounded-2xl
              bg-[#18392B]
              text-white
              shadow-[0_8px_22px_rgba(24,57,43,0.16)]
            ">
              <BadgeDollarSign
                size={20}
              />
            </div>

            <p className="
              mt-5
              text-xs
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#859089]
            ">
              Configuración
            </p>

            <h1 className="
              mt-1
              text-2xl
              font-semibold
              tracking-tight
              text-[#1B1E1C]
              sm:text-3xl
            ">
              Administrador
            </h1>

            <p className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-[#78817B]
            ">
              Configurá quién cumple
              el rol de administrador,
              la vigencia y los jornales
              mensuales correspondientes.
            </p>

          </div>


          <button
            type="button"
            onClick={handleNuevo}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[#18392B]
              px-4 py-3
              text-sm
              font-semibold
              text-white
              shadow-[0_8px_20px_rgba(24,57,43,0.14)]
              transition
              hover:bg-[#224C3A]
            "
          >
            <Plus size={18} />

            Agregar
          </button>

        </div>


        {/* ===========================================
            CONTENIDO
        =========================================== */}

        <div className="mt-7">

          {loading ? (

            <div className="
              rounded-[24px]
              border
              border-[#E4E8E5]
              bg-white
              p-6
              text-sm
              text-[#78817B]
            ">
              Cargando...
            </div>

          ) : registros.length === 0 ? (

            <div className="
              rounded-[26px]
              border
              border-dashed
              border-[#D8DEDA]
              bg-white
              p-8
              text-center
            ">

              <div className="
                mx-auto
                flex h-12 w-12
                items-center
                justify-center
                rounded-2xl
                bg-[#EEF3EF]
                text-[#18392B]
              ">
                <UserRound
                  size={22}
                />
              </div>

              <h2 className="
                mt-4
                text-base
                font-semibold
                text-[#242925]
              ">
                Sin administrador configurado
              </h2>

              <p className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                leading-6
                text-[#7B847E]
              ">
                Agregá un administrador
                para definir quién recibirá
                el concepto mensual en las
                liquidaciones de personal.
              </p>

            </div>

          ) : (

            <div className="
              grid gap-4
              md:grid-cols-2
            ">

              {registros.map(
                (item) => (

                  <article
                    key={item.id}
                    className="
                      rounded-[26px]
                      border
                      border-[#E4E8E5]
                      bg-white
                      p-5
                      shadow-[0_8px_28px_rgba(27,30,28,0.04)]
                    "
                  >

                    <div className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    ">

                      <div className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                      ">

                        <div className="
                          flex h-11 w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-[#EEF3EF]
                          text-[#18392B]
                        ">
                          <UserRound
                            size={20}
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="
                            truncate
                            text-base
                            font-semibold
                            text-[#242925]
                          ">
                            {
                              item.peon_nombre
                            }
                          </p>

                          <p className="
                            mt-1
                            text-xs
                            text-[#7B847E]
                          ">
                            Administrador
                          </p>

                        </div>

                      </div>


                      <div className="
                        flex
                        shrink-0
                        gap-1
                      ">

                        <button
                          type="button"
                          onClick={() =>
                            handleEditar(
                              item
                            )
                          }
                          className="
                            flex h-9 w-9
                            items-center
                            justify-center
                            rounded-xl
                            text-[#667069]
                            transition
                            hover:bg-[#EEF3EF]
                            hover:text-[#18392B]
                          "
                        >
                          <Edit3 size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEliminar(
                              item
                            )
                          }
                          className="
                            flex h-9 w-9
                            items-center
                            justify-center
                            rounded-xl
                            text-[#A66565]
                            transition
                            hover:bg-red-50
                            hover:text-red-600
                          "
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </div>


                    <div className="
                      mt-5
                      grid
                      grid-cols-2
                      gap-3
                    ">

                      <div className="
                        rounded-2xl
                        bg-[#F6F8F6]
                        p-3
                      ">

                        <p className="
                          text-xs
                          font-medium
                          text-[#859089]
                        ">
                          Jornales / mes
                        </p>

                        <p className="
                          mt-1
                          text-lg
                          font-semibold
                          text-[#18392B]
                        ">
                          {
                            Number(
                              item
                                .cantidad_jornales
                            )
                          }
                        </p>

                      </div>


                      <div className="
                        rounded-2xl
                        bg-[#F6F8F6]
                        p-3
                      ">

                        <div className="
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          font-medium
                          text-[#859089]
                        ">
                          <CalendarDays
                            size={14}
                          />

                          Vigencia
                        </div>

                        <p className="
                          mt-1
                          text-xs
                          font-semibold
                          leading-5
                          text-[#3B423E]
                        ">
                          {
                            formatDate(
                              item
                                .vigente_desde
                            )
                          }
                          {" → "}
                          {
                            formatDate(
                              item
                                .vigente_hasta
                            )
                          }
                        </p>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>


        <AdministradorModal
          open={modalOpen}
          administrador={
            seleccionado
          }
          onClose={() => {
            setModalOpen(false);
            setSeleccionado(null);
          }}
          onSuccess={async () => {
            setModalOpen(false);
            setSeleccionado(null);

            await cargar();
          }}
        />

      </div>

    </div>
  );
}