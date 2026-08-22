import {
  ArrowRight,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";


interface Props {
  title: string;
  description: string;

  to: string;

  icon: LucideIcon;

  badge?: string;
}


export default function AdminModuleCard({
  title,
  description,
  to,
  icon: Icon,
  badge,
}: Props) {
  return (
    <Link
      to={to}
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-emerald-200
        hover:shadow-lg
        sm:p-6
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
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
            bg-emerald-50
            text-emerald-700
            transition
            group-hover:bg-emerald-100
          "
        >
          <Icon size={24} />
        </div>

        {badge && (
          <span
            className="
              rounded-full
              bg-amber-50
              px-3
              py-1
              text-xs
              font-semibold
              text-amber-700
            "
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-5">
        <h2
          className="
            text-lg
            font-bold
            text-slate-900
          "
        >
          {title}
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          {description}
        </p>
      </div>

      <div
        className="
          mt-5
          flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-emerald-700
        "
      >
        Ingresar

        <ArrowRight
          size={17}
          className="
            transition-transform
            group-hover:translate-x-1
          "
        />
      </div>
    </Link>
  );
}