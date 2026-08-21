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
      </Route>
    </Route>
  </Routes>

  </BrowserRouter>
  );
}


export default App;