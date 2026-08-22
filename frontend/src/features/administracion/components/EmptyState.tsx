import {
  Inbox,
} from "lucide-react";


interface Props {
  title?: string;
  description?: string;
}


export default function EmptyState({
  title = "No hay registros",
  description = "No encontramos movimientos para mostrar.",
}: Props) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-300
        bg-slate-50
        px-6
        py-12
        text-center
      "
    >
      <div
        className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-white
          text-slate-400
          shadow-sm
        "
      >
        <Inbox size={23} />
      </div>

      <h3
        className="
          mt-4
          font-semibold
          text-slate-800
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          max-w-md
          text-sm
          leading-6
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}