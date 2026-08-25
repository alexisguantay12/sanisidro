import {
  useEffect,
  useState,
} from "react";

import {
  Banknote,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import {
  anularLiquidacionPersonal,
  getLiquidacionPersonal,
} from "../../features/administracion/api";

import ComprobantePagoPersonal
  from "../../features/administracion/components/ComprobantePagoPersonal";

import DetailActions
  from "../../features/administracion/components/DetailActions";

import PageHeader
  from "../../features/administracion/components/PageHeader";

import type {
  LiquidacionPersonal,
} from "../../features/administracion/types";


export default function DetallePersonalPage() {
  const {
    id,
  } = useParams();

  const [
    item,
    setItem,
  ] =
    useState<LiquidacionPersonal | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(false);


  async function load() {
    if (!id) {
      return;
    }

    const result =
      await getLiquidacionPersonal(
        Number(id),
      );

    setItem(result);
  }


  useEffect(() => {
    load();
  }, [
    id,
  ]);


  async function anular(
    motivo: string,
  ) {
    if (!item) {
      return;
    }

    try {
      setLoading(true);

      await anularLiquidacionPersonal(
        item.id,
        motivo,
      );

      await load();
    } finally {
      setLoading(false);
    }
  }


  if (!item) {
    return (
      <div
        className="
          p-8
          text-center
          text-slate-500
        "
      >
        Cargando...
      </div>
    );
  }


  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        sm:px-6

        print:bg-white
        print:p-0
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
        "
      >

        {/* ===================================================
            HEADER DE LA APP
            NO SALE EN LA IMPRESION
        =================================================== */}

        <div
          className="
            print:hidden
          "
        >
          <PageHeader
            title={`Pago al personal N° ${item.id}`}
            description="Detalle completo del pago realizado."
            icon={Banknote}
            backTo="/administracion/personal/historial"
          />
        </div>


        {/* ===================================================
            ACCIONES
            NO SALEN EN LA IMPRESION
        =================================================== */}

        <div
          className="
            mb-5
            flex
            justify-end
            print:hidden
          "
        >
          <DetailActions
            estado={item.estado}
            loading={loading}
            onAnular={anular}
          />
        </div>


        {/* ===================================================
            COMPROBANTE
        =================================================== */}

        <div
          className="
            rounded-3xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm

            sm:p-8

            print:rounded-none
            print:border-0
            print:p-0
            print:shadow-none
          "
        >
          <ComprobantePagoPersonal
            liquidacion={item}
          />
        </div>

      </div>
    </main>
  );
}
