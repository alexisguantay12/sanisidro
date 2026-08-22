import {
  Ban,
  CheckCircle2,
} from "lucide-react";

import type {
  EstadoLiquidacion as Estado,
} from "../types";


interface Props {
  estado: Estado;
}


export default function EstadoLiquidacion({
  estado,
}: Props) {
  if (estado === "ANULADA") {
    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          bg-red-50
          px-3
          py-1
          text-xs
          font-semibold
          text-red-700
        "
      >
        <Ban size={14} />

        Anulada
      </span>
    );
  }


  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-emerald-50
        px-3
        py-1
        text-xs
        font-semibold
        text-emerald-700
      "
    >
      <CheckCircle2 size={14} />

      Activa
    </span>
  );
}