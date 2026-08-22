import type {
  LucideIcon,
} from "lucide-react";


interface Props {
  title: string;
  value: string;

  icon: LucideIcon;

  description?: string;
}


export default function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
}: Props) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <p
          className="
            text-sm
            font-medium
            text-slate-500
          "
        >
          {title}
        </p>

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            bg-slate-100
            text-slate-600
          "
        >
          <Icon size={18} />
        </div>
      </div>

      <p
        className="
          mt-3
          break-words
          text-2xl
          font-bold
          tracking-tight
          text-slate-900
        "
      >
        {value}
      </p>

      {description && (
        <p
          className="
            mt-1
            text-xs
            text-slate-400
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}