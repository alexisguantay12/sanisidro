import {
  NavLink,
} from "react-router-dom";


interface Props {
  pendientesTo: string;
  historialTo: string;
}


export default function AdministracionTabs({
  pendientesTo,
  historialTo,
}: Props) {
  function itemClass({
    isActive,
  }: {
    isActive: boolean;
  }) {
    return `
      flex-1
      rounded-xl
      px-4
      py-2.5
      text-center
      text-sm
      font-semibold
      transition
      ${
        isActive
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-500 hover:text-slate-800"
      }
    `;
  }


  return (
    <div
      className="
        mb-5
        flex
        rounded-2xl
        bg-slate-100
        p-1
        print:hidden
      "
    >
      <NavLink
        end
        to={pendientesTo}
        className={itemClass}
      >
        Pendientes
      </NavLink>

      <NavLink
        to={historialTo}
        className={itemClass}
      >
        Historial
      </NavLink>
    </div>
  );
}