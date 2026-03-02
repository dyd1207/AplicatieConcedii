import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Cereri from "../pages/Cereri";
import Avizare from "../pages/Avizare";
import Aprobare from "../pages/Aprobare";
import Secretariat from "../pages/Secretariat";
import Pontator from "../pages/Pontator";
import Admin from "../pages/Admin";
import Rapoarte from "../pages/Rapoarte";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cereri" element={<Cereri />} />
        <Route path="/avizare" element={<Avizare />} />
        <Route path="/aprobare" element={<Aprobare />} />
        <Route path="/secretariat" element={<Secretariat />} />
        <Route path="/pontator" element={<Pontator />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/rapoarte" element={<Rapoarte />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}