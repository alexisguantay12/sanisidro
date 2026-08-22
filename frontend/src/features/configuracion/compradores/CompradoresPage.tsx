import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  deleteComprador,
  getCompradores,
} from "./api";
 
import type {
  Comprador,
} from "./types";

import CompradorModal from "./CompradorModal";

import ConfirmDeleteCompradorModal from "./ConfirmDeleteModal";

export default function CompradoresPage() {
  const navigate =
    useNavigate();

  const [
    compradores,
    setCompradores,
  ] = useState<Comprador[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    compradorEditando,
    setCompradorEditando,
  ] = useState<Comprador | null>(
    null
  );

  const [
    compradorEliminar,
    setCompradorEliminar,
  ] = useState<Comprador | null>(
    null
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const cargarCompradores =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getCompradores();

          setCompradores(
            data
          );
        } catch (error) {
          console.error(
            "Error cargando compradores",
            error
          );

          setError(
            "No se pudieron cargar los compradores."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    cargarCompradores();
  }, [
    cargarCompradores,
  ]);

  const compradoresFiltrados =
    useMemo(() => {
      const termino =
        search
          .trim()
          .toLowerCase();

      if (!termino) {
        return compradores;
      }

      return compradores.filter(
        (comprador) =>
          comprador.nombre
            .toLowerCase()
            .includes(termino) ||
          (
            comprador.observacion ??
            ""
          )
            .toLowerCase()
            .includes(termino)
      );
    }, [
      compradores,
      search,
    ]);

  function handleNuevo() {
    setCompradorEditando(
      null
    );

    setModalOpen(true);
  }

  function handleEditar(
    comprador: Comprador
  ) {
    setCompradorEditando(
      comprador
    );

    setModalOpen(true);
  }

  function handleCerrarModal() {
    setModalOpen(false);
    setCompradorEditando(
      null
    );
  }

  async function handleEliminar() {
    if (
      !compradorEliminar
    ) {
      return;
    }

    try {
      setDeleting(true);

      await deleteComprador(
        compradorEliminar.id
      );

      setCompradorEliminar(
        null
      );

      await cargarCompradores();
    } catch (error) {
      console.error(
        "Error eliminando comprador",
        error
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#F6F8F6]">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* VOLVER */}
        <button
          type="button"
          onClick={() =>
            navigate(
              "/configuracion"
            )
          }
          className="
            mb-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            px-1 py-2
            text-sm
            font-semibold
            text-[#69716C]
            transition
            hover:text-[#18392B]
          "
        >
          <ArrowLeft
            size={17}
          />

          Configuración
        </button>

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18392B] text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)]">
              <Users
                size={20}
              />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Configuración
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
              Compradores
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#78817B]">
              Administrá los
              compradores
              disponibles para
              registrar ventas.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleNuevo
            }
            className="
              inline-flex
              h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#18392B]
              px-5
              text-sm
              font-semibold
              text-white
              shadow-[0_8px_24px_rgba(24,57,43,0.16)]
              transition
              hover:bg-[#204A38]
              sm:w-auto
            "
          >
            <Plus size={18} />

            Nuevo comprador
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="mt-7">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#929B95]
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Buscar comprador..."
              className="
                h-12
                w-full
                rounded-xl
                border
                border-[#E1E6E2]
                bg-white
                pl-11
                pr-4
                text-sm
                text-[#242925]
                outline-none
                transition
                placeholder:text-[#9AA29D]
                focus:border-[#18392B]
                focus:ring-2
                focus:ring-[#18392B]/10
              "
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="mt-6 rounded-[24px] border border-[#E4E8E5] bg-white p-8 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
            <p className="text-sm text-[#7B847E]">
              Cargando
              compradores...
            </p>
          </div>
        ) : compradoresFiltrados
            .length === 0 ? (
          /* VACÍO */
          <div className="mt-6 rounded-[24px] border border-[#E4E8E5] bg-white px-5 py-12 text-center shadow-[0_8px_28px_rgba(27,30,28,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#18392B]">
              <UserRound
                size={25}
              />
            </div>

            <h2 className="mt-4 text-base font-semibold text-[#242925]">
              {search
                ? "No encontramos compradores"
                : "Todavía no hay compradores"}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7B847E]">
              {search
                ? "Probá con otro nombre o término de búsqueda."
                : "Agregá el primer comprador para comenzar a registrar ventas."}
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE */}
            <div className="mt-6 space-y-3 md:hidden">
              {compradoresFiltrados.map(
                (comprador) => (
                  <div
                    key={
                      comprador.id
                    }
                    className="
                      rounded-[22px]
                      border border-[#E4E8E5]
                      bg-white
                      p-4
                      shadow-[0_6px_20px_rgba(27,30,28,0.035)]
                    "
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3EF] text-[#18392B]">
                        <UserRound
                          size={
                            20
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#242925]">
                          {
                            comprador.nombre
                          }
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7B847E]">
                          {comprador.observacion ||
                            "Sin observaciones"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-[#EEF1EF] pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleEditar(
                            comprador
                          )
                        }
                        className="
                          flex
                          h-10
                          flex-1
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-[#F2F5F3]
                          text-sm
                          font-semibold
                          text-[#31503F]
                          transition
                          hover:bg-[#E8EFEB]
                        "
                      >
                        <Pencil
                          size={
                            16
                          }
                        />

                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCompradorEliminar(
                            comprador
                          )
                        }
                        className="
                          flex
                          h-10
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-red-50
                          text-red-600
                          transition
                          hover:bg-red-100
                        "
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* DESKTOP */}
            <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-[#E4E8E5] bg-white shadow-[0_8px_28px_rgba(27,30,28,0.04)] md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EAEDEA] bg-[#FAFBFA]">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Comprador
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Observación
                    </th>

                    <th className="w-[130px] px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {compradoresFiltrados.map(
                    (
                      comprador
                    ) => (
                      <tr
                        key={
                          comprador.id
                        }
                        className="border-b border-[#EEF1EF] last:border-b-0 transition hover:bg-[#FAFBFA]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3EF] text-[#18392B]">
                              <UserRound
                                size={
                                  18
                                }
                              />
                            </div>

                            <span className="text-sm font-semibold text-[#242925]">
                              {
                                comprador.nombre
                              }
                            </span>
                          </div>
                        </td>

                        <td className="max-w-md px-5 py-4">
                          <p className="truncate text-sm text-[#707A73]">
                            {comprador.observacion ||
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="Editar"
                              onClick={() =>
                                handleEditar(
                                  comprador
                                )
                              }
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                text-[#657069]
                                transition
                                hover:bg-[#EEF3EF]
                                hover:text-[#18392B]
                              "
                            >
                              <Pencil
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Dar de baja"
                              onClick={() =>
                                setCompradorEliminar(
                                  comprador
                                )
                              }
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-xl
                                text-[#8A948E]
                                transition
                                hover:bg-red-50
                                hover:text-red-600
                              "
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <CompradorModal
          open={modalOpen}
          comprador={
            compradorEditando
          }
          onClose={
            handleCerrarModal
          }
          onSuccess={
            cargarCompradores
          }
        />

        <ConfirmDeleteCompradorModal
          open={
            compradorEliminar !==
            null
          }
          nombre={
            compradorEliminar
              ?.nombre ?? ""
          }
          loading={
            deleting
          }
          onCancel={() =>
            setCompradorEliminar(
              null
            )
          }
          onConfirm={
            handleEliminar
          }
        />
      </div>
    </div>
  );
}