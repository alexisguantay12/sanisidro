import {
  Home,
  CalendarDays,
  Menu,
} from "lucide-react";

import { NavLink } from "react-router-dom";

export default function BottomNavigation() {
  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl">
        <NavLink to="/" className={itemClass}>
          <Home size={22} />
          Inicio
        </NavLink>

        <NavLink to="/tarjas" className={itemClass}>
          <CalendarDays size={22} />
          Tarjas
        </NavLink>

        <NavLink to="/mas" className={itemClass}>
          <Menu size={22} />
          Más
        </NavLink>
      </div>
    </nav>
  );
}