import {
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  UserRound,
} from "lucide-react";

import { login } from "./api";

import {
  saveTokens,
} from "./authStorage";


export default function LoginForm() {

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !username.trim() ||
      !password
    ) {
      setError(
        "Ingresá usuario y contraseña."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const tokens =
        await login({
          username:
            username.trim(),
          password,
        });

      saveTokens(
        tokens.access,
        tokens.refresh
      );

      window.location.href =
        "/";

    } catch {
      setError(
        "Usuario o contraseña incorrectos."
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-dvh bg-[#F3F5F3]">

      <div className="grid min-h-dvh lg:grid-cols-[1.08fr_0.92fr]">

        {/* FOTO */}
        <section
          className="
            relative
            min-h-[250px]
            overflow-hidden
            bg-[#18392B]
            sm:min-h-[320px]
            lg:min-h-dvh
          "
        >

          <img
            src="/images/login-san-isidro.jpg"
            alt="Campo San Isidro"
            className="absolute inset-0 h-full w-full object-cover"
          />


          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#10291F]/95 via-[#10291F]/35 to-black/5 lg:bg-gradient-to-r lg:from-[#10291F]/80 lg:via-[#10291F]/20 lg:to-transparent" />


          {/* TEXTO FOTO */}
          <div
            className="
              relative z-10
              flex h-full min-h-[250px]
              flex-col justify-end
              px-6 pb-7
              sm:min-h-[320px]
              sm:px-9 sm:pb-9
              lg:min-h-dvh
              lg:px-12 lg:pb-12
              xl:px-16
            "
          >

            <div className="max-w-xl">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-md">
                <Leaf size={24} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                Sistema de gestión
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                San Isidro
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/75 sm:text-base">
                Gestión simple y ordenada
                del trabajo diario del campo.
              </p>

            </div>

          </div>

        </section>


        {/* LOGIN */}
        <section
          className="
            flex items-center justify-center
            px-4 py-8
            sm:px-8 sm:py-12
            lg:px-12
          "
        >

          <div className="w-full max-w-md">

            {/* CABECERA */}
            <div className="mb-8">

              <div className="mb-6 hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#18392B] text-white shadow-[0_8px_24px_rgba(24,57,43,0.18)] lg:flex">
                <Leaf size={23} />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#87908A]">
                Bienvenido
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1B1E1C]">
                Iniciar sesión
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#747D77]">
                Ingresá tus credenciales
                para acceder a San Isidro.
              </p>

            </div>


            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              {/* ERROR */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}


              {/* USUARIO */}
              <div>

                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-[#404743]"
                >
                  Usuario
                </label>

                <div className="relative">

                  <UserRound
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#949D97]"
                  />

                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="Ingresá tu usuario"
                    value={username}
                    onChange={(e) =>
                      setUsername(
                        e.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                    className="
                      h-13 w-full
                      rounded-2xl
                      border border-[#DCE2DE]
                      bg-white
                      pl-12 pr-4
                      text-sm text-[#2E3430]
                      outline-none
                      transition
                      placeholder:text-[#A5ADA7]
                      focus:border-[#9FB4A6]
                      focus:ring-4
                      focus:ring-[#18392B]/5
                      disabled:bg-[#F6F7F6]
                    "
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#404743]"
                >
                  Contraseña
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#949D97]"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Ingresá tu contraseña"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    disabled={
                      loading
                    }
                    className="
                      h-13 w-full
                      rounded-2xl
                      border border-[#DCE2DE]
                      bg-white
                      pl-12 pr-12
                      text-sm text-[#2E3430]
                      outline-none
                      transition
                      placeholder:text-[#A5ADA7]
                      focus:border-[#9FB4A6]
                      focus:ring-4
                      focus:ring-[#18392B]/5
                      disabled:bg-[#F6F7F6]
                    "
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    disabled={
                      loading
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-[#7E8781] transition hover:bg-[#F2F4F2] hover:text-[#18392B] disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
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


              {/* BOTÓN */}
              <button
                type="submit"
                disabled={
                  loading
                }
                className="
                  flex h-13 w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#18392B]
                  px-5
                  text-sm font-semibold
                  text-white
                  shadow-[0_10px_28px_rgba(24,57,43,0.20)]
                  transition
                  hover:bg-[#204A38]
                  hover:shadow-[0_12px_32px_rgba(24,57,43,0.24)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Ingresando..."
                  : "Ingresar"}
              </button>

            </form>


            {/* FOOTER */}
            <p className="mt-8 text-center text-xs text-[#98A09B]">
              Sistema San Isidro
            </p>

          </div>

        </section>

      </div>

    </div>
  );
}