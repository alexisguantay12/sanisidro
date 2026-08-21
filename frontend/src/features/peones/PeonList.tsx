import type { Peon } from "./types";
import { deletePeon } from "./api";

interface Props {
  peones: Peon[];
  onDeleted: () => void;
}

export default function PeonList({
  peones,
  onDeleted,
}: Props) {

  async function handleDelete(id: number) {
    const confirmacion = window.confirm(
      "¿Seguro que querés dar de baja este peón?"
    );

    if (!confirmacion) {
      return;
    }

    try {
      await deletePeon(id);
      onDeleted();
    } catch (error) {
      console.error(
        "Error eliminando peón",
        error
      );
    }
  }

  return (
    <div>
      <h2>Peones</h2>

      {peones.length === 0 ? (
        <p>No hay peones registrados.</p>
      ) : (
        <ul>
          {peones.map((peon) => (
            <li key={peon.id}>
              {peon.nombre}

              <button
                onClick={() =>
                  handleDelete(peon.id)
                }
              >
                Dar de baja
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}