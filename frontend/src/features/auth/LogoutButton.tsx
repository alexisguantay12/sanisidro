import { useState } from "react";

import { login } from "./api";
import { saveTokens } from "./authStorage";


export default function LoginForm() {

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!username || !password) {
      setError(
        "Ingresá usuario y contraseña"
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const tokens = await login({
        username,
        password,
      });

      saveTokens(
        tokens.access,
        tokens.refresh
      );

      window.location.href = "/";

    } catch {
      setError(
        "Usuario o contraseña incorrectos"
      );

    } finally {
      setLoading(false);
    }
  }


  return (
    <form onSubmit={handleSubmit}>

      <h2>
        Iniciar sesión
      </h2>

      <input
        type="text"
        placeholder="Usuario"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      {error && (
        <p>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Ingresando..."
          : "Ingresar"
        }
      </button>

    </form>
  );
}