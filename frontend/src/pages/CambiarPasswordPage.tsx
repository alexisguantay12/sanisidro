import {
  useState,
} from "react";

import { clearTokens } from "../features/auth/authStorage";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  cambiarPassword,
} from "../features/auth/api";


export default function CambiarPasswordPage() {

  const navigate =
    useNavigate();


  const [
    passwordActual,
    setPasswordActual,
  ] = useState("");


  const [
    passwordNueva,
    setPasswordNueva,
  ] = useState("");


  const [
    confirmacion,
    setConfirmacion,
  ] = useState("");


  const [
    showActual,
    setShowActual,
  ] = useState(false);


  const [
    showNueva,
    setShowNueva,
  ] = useState(false);


  const [
    showConfirmacion,
    setShowConfirmacion,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();


    setError("");
    setSuccess("");


    if (
      !passwordActual ||
      !passwordNueva ||
      !confirmacion
    ) {
      setError(
        "Completá todos los campos."
      );

      return;
    }


    if (
      passwordNueva
      !== confirmacion
    ) {
      setError(
        "Las nuevas contraseñas no coinciden."
      );

      return;
    }


    if (
      passwordActual
      === passwordNueva
    ) {
      setError(
        "La nueva contraseña debe ser diferente a la actual."
      );

      return;
    }


    try {
      setLoading(true);


      await cambiarPassword({
        password_actual:
          passwordActual,

        password_nueva:
          passwordNueva,

        password_nueva_confirmacion:
          confirmacion,
      });


      setPasswordActual("");
      setPasswordNueva("");
      setConfirmacion("");


      setSuccess(
        "Contraseña actualizada. Volvé a iniciar sesión."
        );

     window.setTimeout(
    () => {
        clearTokens();

        window.location.href =
        "/login";
    },
    1800
    );


    } catch (error: any) {
      console.error(error);


      const data =
        error?.response?.data;


      const detail =
        data?.password_actual?.[0] ??
        data?.password_nueva?.[0] ??
        data?.password_nueva_confirmacion?.[0] ??
        data?.detail;


      setError(
        detail ??
        "No se pudo cambiar la contraseña."
      );


    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-full bg-[#F6F8F6]">

      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-7">

        {/* VOLVER */}
        <button
          type="button"
          onClick={() =>
            navigate(
              "/configuracion"
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#68716B] transition hover:text-[#18392B]"
        >
          <ArrowLeft
            size={17}
          />

          Configuración
        </button>


        {/* HEADER */}
        <div className="mb-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18392B] text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)]">
            <KeyRound
              size={22}
            />
          </div>


          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
            Cuenta
          </p>


          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
            Cambiar contraseña
          </h1>


          <p className="mt-2 max-w-xl text-sm leading-6 text-[#78817B]">
            Actualizá la contraseña
            utilizada para ingresar
            al sistema.
          </p>

        </div>


        {/* CARD */}
        <div className="overflow-hidden rounded-[26px] border border-[#E4E8E5] bg-white shadow-[0_8px_28px_rgba(27,30,28,0.04)]">

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="space-y-5 p-5 sm:p-6">


              {/* ERROR */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}


              {/* SUCCESS */}
              {success && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">

                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {success}
                  </span>

                </div>
              )}


              {/* ACTUAL */}
              <div>

                <label
                  htmlFor="password-actual"
                  className="mb-2 block text-sm font-semibold text-[#444B47]"
                >
                  Contraseña actual
                </label>


                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#949D97]"
                  />


                  <input
                    id="password-actual"
                    type={
                      showActual
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={
                      passwordActual
                    }
                    onChange={(e) =>
                      setPasswordActual(
                        e.target.value
                      )
                    }
                    placeholder="Ingresá tu contraseña actual"
                    disabled={
                      loading ||
                      Boolean(success)
                    }
                    className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white pl-11 pr-12 text-sm text-[#333936] outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowActual(
                        (value) =>
                          !value
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#7E8781] hover:bg-[#F3F5F3]"
                  >
                    {showActual ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>

                </div>

              </div>


              {/* NUEVA */}
              <div>

                <label
                  htmlFor="password-nueva"
                  className="mb-2 block text-sm font-semibold text-[#444B47]"
                >
                  Nueva contraseña
                </label>


                <div className="relative">

                  <KeyRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#949D97]"
                  />


                  <input
                    id="password-nueva"
                    type={
                      showNueva
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={
                      passwordNueva
                    }
                    onChange={(e) =>
                      setPasswordNueva(
                        e.target.value
                      )
                    }
                    placeholder="Ingresá la nueva contraseña"
                    disabled={
                      loading ||
                      Boolean(success)
                    }
                    className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white pl-11 pr-12 text-sm text-[#333936] outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowNueva(
                        (value) =>
                          !value
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#7E8781] hover:bg-[#F3F5F3]"
                  >
                    {showNueva ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>

                </div>


                <p className="mt-2 text-xs leading-5 text-[#8A938D]">
                  Usá una contraseña segura
                  que no hayas utilizado
                  anteriormente.
                </p>

              </div>


              {/* CONFIRMACIÓN */}
              <div>

                <label
                  htmlFor="password-confirmacion"
                  className="mb-2 block text-sm font-semibold text-[#444B47]"
                >
                  Repetir nueva contraseña
                </label>


                <div className="relative">

                  <KeyRound
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#949D97]"
                  />


                  <input
                    id="password-confirmacion"
                    type={
                      showConfirmacion
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={
                      confirmacion
                    }
                    onChange={(e) =>
                      setConfirmacion(
                        e.target.value
                      )
                    }
                    placeholder="Repetí la nueva contraseña"
                    disabled={
                      loading ||
                      Boolean(success)
                    }
                    className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white pl-11 pr-12 text-sm text-[#333936] outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmacion(
                        (value) =>
                          !value
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#7E8781] hover:bg-[#F3F5F3]"
                  >
                    {showConfirmacion ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye
                        size={18}
                      />
                    )}
                  </button>

                </div>

              </div>

            </div>


            {/* FOOTER */}
            <div className="border-t border-[#EEF1EF] bg-white px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:px-6 sm:pb-5">

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/configuracion"
                    )
                  }
                  disabled={
                    loading
                  }
                  className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F8F7] disabled:opacity-50"
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  disabled={
                    loading ||
                    Boolean(success)
                  }
                  className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Guardando..."
                    : "Cambiar contraseña"}
                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}