import type {
  LucideIcon,
} from "lucide-react";

import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


interface Props {
  title: string;
  description: string;

  icon: LucideIcon;

  backTo?: string;
}


export default function PageHeader({
  title,
  description,
  icon: Icon,
  backTo = "/administracion",
}: Props) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() =>
          navigate(backTo)
        }
        className="
          mb-4
          inline-flex
          items-center
          gap-2
          rounded-xl
          px-3
          py-2
          text-sm
          font-medium
          text-slate-600
          transition
          hover:bg-slate-100
          hover:text-slate-900
        "
      >
        <ArrowLeft size={18} />

        Volver
      </button>

      <div
        className="
          flex
          items-start
          gap-4
        "
      >
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-emerald-100
            text-emerald-700
          "
        >
          <Icon size={24} />
        </div>

        <div>
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-slate-900
              sm:text-3xl
            "
          >
            {title}
          </h1>

          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              leading-6
              text-slate-500
              sm:text-base
            "
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}