
import { useEffect, useState } from "react";
import { Printer, Wheat } from "lucide-react";
import { useParams } from "react-router-dom";
import { getLiquidacionCarpida } from "../../features/administracion/api";
import EstadoLiquidacion from "../../features/administracion/components/EstadoLiquidacion";
import PageHeader from "../../features/administracion/components/PageHeader";
import type { LiquidacionCarpida } from "../../features/administracion/types";
import { formatDate, money } from "../../features/administracion/utils";

export default function DetalleCarpidasPage() {
  const { id } = useParams();
  const [item, setItem] = useState<LiquidacionCarpida | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    if (!id || !/^[1-9]\d*$/.test(id)) {
      setError("Identificador de liquidación inválido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getLiquidacionCarpida(Number(id))
      .then((data) => {
        if (activo) setItem(data);
      })
      .catch(() => {
        if (activo) {
          setError("No se pudo obtener la liquidación.");
        }
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando liquidación...
      </div>
    );
  }

  if (error || !item) {
    return (
      <div role="alert" className="p-8 text-center text-red-700">
        {error || "Liquidación no encontrada."}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 print:bg-white">
      <div className="mx-auto max-w-4xl">
        <div className="print:hidden">
          <PageHeader
            title={`Liquidación #${item.id}`}
            description="Detalle del pago de carpidas."
            icon={Wheat}
            backTo="/administracion/carpidas/historial"
          />
        </div>

        <article className="rounded-3xl border bg-white p-5 shadow-sm sm:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                San Isidro
              </p>
              <h1 className="mt-1 text-2xl font-bold">
                Liquidación de carpidas
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Liquidación #{item.id}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Pago realizado {formatDate(item.fecha_pago)}
              </p>
            </div>
            <EstadoLiquidacion estado={item.estado} />
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2 print:border print:bg-white">
            <div>
              <p className="text-slate-500">Período liquidado</p>
              <p className="font-semibold">
                {formatDate(item.fecha_desde)} al{" "}
                {formatDate(item.fecha_hasta)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Cuenta de origen</p>
              <p className="font-semibold">
                {item.cuenta_financiera_nombre || "Sin información"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Cantidad de carpidas</p>
              <p className="font-semibold">
                {item.cantidad_carpidas}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Fecha de pago</p>
              <p className="font-semibold">
                {formatDate(item.fecha_pago)}
              </p>
            </div>
          </div>

          <div className="mt-7 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-slate-400">
                  <th className="py-3">Fecha</th>
                  <th>Jornada</th>
                  <th className="text-right">Valor jornal</th>
                  <th className="text-right">Importe</th>
                </tr>
              </thead>
              <tbody>
                {item.detalles.map((detalle) => (
                  <tr key={detalle.id} className="border-b">
                    <td className="py-3">
                      {formatDate(detalle.fecha)}
                    </td>
                    <td>
                      {detalle.tipo_jornada_display ||
                        (detalle.tipo_jornada === "MEDIO_DIA"
                          ? "Medio día"
                          : "Día")}
                    </td>
                    <td className="text-right">
                      {money(detalle.valor_jornal_aplicado)}
                    </td>
                    <td className="text-right font-semibold">
                      {money(detalle.importe)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {item.detalles.some((detalle) => detalle.observacion) && (
            <div className="mt-5 space-y-2 text-sm">
              <h2 className="font-bold">Observaciones de los jornales</h2>
              {item.detalles
                .filter((detalle) => detalle.observacion)
                .map((detalle) => (
                  <p key={detalle.id} className="text-slate-600">
                    {formatDate(detalle.fecha)}: {detalle.observacion}
                  </p>
                ))}
            </div>
          )}

          <div className="mt-8 rounded-2xl bg-slate-900 p-5 text-white print:border print:bg-white print:text-black">
            <p className="text-sm opacity-70">
              Total liquidado
            </p>
            <p className="text-3xl font-bold">
              {money(item.total)}
            </p>
          </div>

          {item.observacion && (
            <div className="mt-6">
              <h2 className="font-semibold">Observación general</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {item.observacion}
              </p>
            </div>
          )}

          {item.estado === "ANULADA" && (
            <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700 print:border">
              <strong>Liquidación anulada</strong>
              <p className="mt-1">
                {item.motivo_anulacion || "Sin motivo registrado."}
              </p>
              {item.fecha_anulacion && (
                <p className="mt-1">
                  Fecha de anulación: {formatDate(item.fecha_anulacion)}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
            >
              <Printer size={18} />
              Imprimir comprobante
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}
