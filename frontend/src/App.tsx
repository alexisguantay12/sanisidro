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
      </Route>
    </Route>
  </Routes>

  </BrowserRouter>
  );
}


export default App;