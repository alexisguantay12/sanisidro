import { Outlet } from "react-router-dom";
import AppHeader from "./AppHeader";
import BottomNavigation from "./BottomNavigation";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6">
        <Outlet />
      </main>

      <BottomNavigation />
    </div>
  );
}