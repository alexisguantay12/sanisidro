import { Settings, Sprout } from "lucide-react";
import { Link } from "react-router-dom";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[#F6F7F5]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#18392B] text-white shadow-sm">
            <Sprout size={20} />
          </div>

          <div>
            <h1 className="text-base font-semibold tracking-tight text-[#1B1E1C]">
              San Isidro
            </h1>

            <p className="text-xs font-medium text-[#7A837D]">
              Campaña 2026–2027
            </p>
          </div>

        </div>

        <Link
          to="/configuracion"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white text-[#4F5852] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Settings size={19} />
        </Link>

      </div>
    </header>
  );
}