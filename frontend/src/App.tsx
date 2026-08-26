import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./features/auth/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/layout/AppLayout";
import PeonesPage from "./pages/PeonesPage";
import TarjasPage from "./pages/TarjasPage";
import HorasExtraPage from "./pages/HorasExtraPage";

import TractorPage from "./pages/TractorPage";
import TractorSergioPage from "./pages/TractorSergioPage";
import TractorTercerosPage from "./pages/TractorTerceroPage";

import InsumosPage from "./pages/InsumosPage";

import ConfiguracionPage
  from "./pages/configuracion/ConfiguracionPage";

import ProveedoresPage from "./pages/configuracion/ProveedoresPage";

import InsumosConfiguracionPage from "./pages/configuracion/InsumosConfiguracionPage";

import ValoresPage
  from "./pages/configuracion/ValoresPage";

import CambiarPasswordPage from "./pages/CambiarPasswordPage";

import AlmacigosPage from "./pages/AlmacigoPage";
import CompradoresPage from "./features/configuracion/compradores/CompradoresPage";
import VentasPage from "./pages/VentasPage";

import AdministracionPage
  from "./pages/administracion/AdministracionPage";

import PersonalPage from "./pages/administracion/PersonalPage";


import HistorialPersonalPage
  from "./pages/administracion/HistorialPersonalPage";

import DetallePersonalPage
  from "./pages/administracion/DetallePersonalPage";

import PagoTractorPage
  from "./pages/administracion/PagoTractorPage";

import HistorialTractorPage
  from "./pages/administracion/HistorialTractorPage";

import DetalleTractorPage
  from "./pages/administracion/DetalleTractorPage";

import PagoAlmacigosPage
  from "./pages/administracion/PagoAlmacigosPage";

import HistorialAlmacigosPage from "./pages/administracion/HistorialAlmacigosPage";

import DetalleAlmacigosPage from "./pages/administracion/DetalleAlmacigosPage";

import RendicionesPage
  from "./pages/administracion/RendicionesPage";

import HistorialRendicionesPage
  from "./pages/administracion/HistorialRendicionesPage";

import DetalleRendicionPage
  from "./pages/administracion/DetalleRendicionPage"; 

import JornalesPage from "./pages/JornalesPage";

import JornalCarpidaPage from "./features/jornalCarpida/JornalCarpidaPage";
 

import MovimientosPage
 from "./features/finanzas/movimientos/MovimientosPage";
import FinanzasPage from "./features/finanzas/FinanzasPage";
import CuentasPage
 from "./features/finanzas/cuentas/CuentasPage";
import CuentaDetallePage
 from "./features/finanzas/cuentas/CuentasDetallePage";
import CategoriasPage
 from "./features/finanzas/categorias/CategoriasPage";
import GruposPage
 from "./features/finanzas/grupos/GruposPage";
import ResumenFinanzasPage from "./features/finanzas/resumen/ResumenFinanzasPage";

import ResumenPage from "./pages/ResumenPage";

import AdministradorPage from "./features/configuracion/AdministradorPage";


function App() {
  return (
  <BrowserRouter>

  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/peones"
          element={<PeonesPage />}
        />
        <Route
          path="/configuracion/administrador"
          element={
            <AdministradorPage />
          }
        />

        <Route
          path="/tarjas"
          element={<TarjasPage />}
        />
        <Route
          path="/tarjas/jornales"
          element={<JornalesPage />}
        />

        <Route
          path="/tarjas/carpida"
          element={<JornalCarpidaPage />}
        />

        <Route
          path="/horas-extra"
          element={<HorasExtraPage />}
        />
        <Route
          path="/tractor"
          element={<TractorPage />}
        />

        <Route
          path="/tractor/sergio"
          element={<TractorSergioPage />}
        />

        <Route
          path="/tractor/terceros"
          element={<TractorTercerosPage />}
        />
        <Route
          path="/insumos"
          element={<InsumosPage />}
        />
        <Route
          path="/configuracion"
          element={<ConfiguracionPage />}
        />

        <Route
          path="/configuracion/proveedores"
          element={<ProveedoresPage />}
        />
        <Route
          path="/configuracion/compradores"
          element={<CompradoresPage />}
        />

        <Route
          path="/configuracion/insumos"
          element={<InsumosConfiguracionPage />}
        />

        <Route
          path="/configuracion/valores"
          element={<ValoresPage />}
        />
        
        <Route
          path="/configuracion/cambiar-password"
          element={
            <CambiarPasswordPage />
          }
        />
        <Route
          path="/almacigos"
          element={
            <AlmacigosPage />
          }
        />
        <Route
          path="/ventas"
          element={<VentasPage />}
        />
       <Route
          path="/administracion"
          element={<AdministracionPage />}
        />

        <Route
          path="/administracion/personal"
          element={<PersonalPage />}
        />

        <Route
          path="/administracion/personal/historial"
          element={<HistorialPersonalPage />}
        />

        <Route
          path="/administracion/personal/:id"
          element={<DetallePersonalPage />}
        />


        <Route
          path="/administracion/tractor"
          element={<PagoTractorPage />}
        />

        <Route
          path="/administracion/tractor/historial"
          element={<HistorialTractorPage />}
        />

        <Route
          path="/administracion/tractor/:id"
          element={<DetalleTractorPage />}
        />


        <Route
          path="/administracion/almacigos"
          element={<PagoAlmacigosPage />}
        />

        <Route
          path="/administracion/almacigos/historial"
          element={<HistorialAlmacigosPage />}
        />

        <Route
          path="/administracion/almacigos/:id"
          element={<DetalleAlmacigosPage />}
        />


        <Route
          path="/administracion/rendiciones"
          element={<RendicionesPage />}
        />

        <Route
          path="/administracion/rendiciones/historial"
          element={<HistorialRendicionesPage />}
        />

        <Route
          path="/administracion/rendiciones/:id"
          element={<DetalleRendicionPage />}
        />

        <Route
          path="/finanzas"
          element={ 
              <FinanzasPage /> 
          }
        />

        <Route
          path="/finanzas/movimientos"
          element={ 
              <MovimientosPage /> 
          }
        />   

        <Route
          path="/finanzas/cuentas"
          element={ 
              <CuentasPage /> 
          }
        />

        <Route
          path="/finanzas/cuentas/:id"
          element={ 
              <CuentaDetallePage /> 
          }
        />

        <Route
          path="/finanzas/categorias"
          element={ 
              <CategoriasPage /> 
          }
        />

        <Route
          path="/finanzas/grupos"
          element={ 
              <GruposPage /> 
          }
        />

        <Route
          path="/finanzas/resumen"
          element={ 
              <ResumenFinanzasPage /> 
          }
        />
        <Route
          path="/resumen"
          element={
            <ResumenPage />
          }
        />


      </Route>
    </Route>
  </Routes>

  </BrowserRouter>
  );
}


export default App;