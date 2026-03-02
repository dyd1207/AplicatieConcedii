import { Outlet } from "react-router-dom";
import AppNavbar from "./AppNavbar";

export default function AppLayout() {
  return (
    <>
      <AppNavbar />
      <main className="app-content">
        <Outlet />
      </main>
    </>
  );
}