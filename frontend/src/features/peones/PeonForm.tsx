import { useState } from "react";
import { createPeon } from "./api";

interface Props {
  onCreated: () => void;
}

export default function PeonForm({ onCreated }: Props) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!nombre.trim()) {
      return;
    }

    try {
      setLoading(true);

      await createPeon({
        nombre: nombre.trim(),
        activo: true,
      });

      setNombre("");

      onCreated();
    } catch (error) {
      console.error("Error creando peón", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Nuevo peón</h2>

      <input
        type="text"
        placeholder="Nombre del peón"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}