import {
  Banknote,
  HandCoins,
  ReceiptText,
  Sprout,
  Tractor,
  WalletCards,
} from "lucide-react";

import AdminModuleCard
  from "../../features/administracion/components/AdminModuleCard";


const modules = [
  {
    title: "Pagos al personal",

    description:
      "Revisar tarjas y horas extra pendientes, liquidar períodos y consultar pagos realizados.",

    to: "/administracion/personal",

    icon: Banknote,
  },

  {
    title: "Pago de tractor",

    description:
      "Liquidar trabajos de tractor de Sergio y servicios realizados por terceros.",

    to: "/administracion/tractor",

    icon: Tractor,
  },

  {
    title: "Pago de almácigos",

    description:
      "Consultar trabajos pendientes y registrar sus liquidaciones de forma ordenada.",

    to: "/administracion/almacigos",

    icon: Sprout,
  },

  {
    title: "Rendición de ventas",

    description:
      "Controlar el dinero cobrado por ventas que todavía debe ingresar a administración.",

    to: "/administracion/rendiciones",

    icon: HandCoins,
  },
];


export default function AdministracionPage() {
  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4
        py-6
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >
        <section
          className="
            relative
            overflow-hidden
            rounded-3xl
            bg-slate-900
            px-6
            py-8
            text-white
            shadow-xl
            sm:px-8
            sm:py-10
          "
        >
          <div
            className="
              relative
              z-10
              max-w-2xl
            "
          >
            <div
              className="
                mb-4
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white/10
              "
            >
              <WalletCards size={25} />
            </div>

            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                sm:text-4xl
              "
            >
              Administración
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-slate-300
                sm:text-base
              "
            >
              Liquidaciones, pagos y
              rendiciones centralizados
              en un solo lugar.
            </p>
          </div>

          <div
            className="
              pointer-events-none
              absolute
              -right-12
              -top-12
              h-56
              w-56
              rounded-full
              bg-emerald-400/10
              blur-3xl
            "
          />
        </section>

        <section
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {modules.map(
            ({
              title,
              description,
              to,
              icon,
            }) => (
              <AdminModuleCard
                key={to}
                title={title}
                description={description}
                to={to}
                icon={icon}
              />
            ),
          )}
        </section>

        <section
          className="
            mt-6
            grid
            grid-cols-1
            gap-4
            lg:grid-cols-2
          "
        >
          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <ReceiptText
                className="text-emerald-700"
                size={22}
              />

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Trazabilidad
              </h2>
            </div>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              "
            >
              Cada pago queda asociado a
              sus registros originales,
              conservando valores,
              períodos y usuario que
              realizó la operación.
            </p>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <Banknote
                className="text-emerald-700"
                size={22}
              />

              <h2
                className="
                  font-bold
                  text-slate-900
                "
              >
                Control administrativo
              </h2>
            </div>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              "
            >
              Revisá primero los
              pendientes y confirmá
              solamente los movimientos
              que realmente querés
              liquidar.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}