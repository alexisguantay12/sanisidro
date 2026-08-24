import {
  ArrowLeft,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


export default function FinanzasBackButton() {

  const navigate =
    useNavigate();

  return (
    <button
      type="button"
      onClick={() =>
        navigate("/finanzas")
      }
      className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold text-[#68716B] transition hover:bg-[#EEF3EF] hover:text-[#18392B]"
    >
      <ArrowLeft size={18} />

      Finanzas
    </button>
  );
}