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
          path="/tarjas"
          element={<TarjasPage />}
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

      </Route>
    </Route>
  </Routes>

  </BrowserRouter>
  );
}


export default App;