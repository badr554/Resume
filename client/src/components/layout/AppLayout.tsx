import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="flex h-screen w-full font-sans bg-bg overflow-hidden text-text-dark">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
