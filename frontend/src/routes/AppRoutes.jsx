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
import Forbidden from "../pages/Forbidden";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Protected layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cereri" element={<Cereri />} />
        <Route path="/rapoarte" element={<Rapoarte />} />
        <Route path="/403" element={<Forbidden />} />

        {/* AVIZARE */}
        <Route
          path="/avizare"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "SEF_STRUCTURA",
                "DIRECTOR_ADJUNCT",
                "PONTATOR",
                "ADMINISTRATOR",
              ]}
            >
              <Avizare />
            </RoleProtectedRoute>
          }
        />

        {/* APROBARE */}
        <Route
          path="/aprobare"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "DIRECTOR",
                "DIRECTOR_ADJUNCT",
                "ADMINISTRATOR",
              ]}
            >
              <Aprobare />
            </RoleProtectedRoute>
          }
        />

        {/* SECRETARIAT */}
        <Route
          path="/secretariat"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "SECRETARIAT",
                "SEF_STRUCTURA",
                "DIRECTOR_ADJUNCT",
                "DIRECTOR",
                "PONTATOR",
                "ADMINISTRATOR",
              ]}
            >
              <Secretariat />
            </RoleProtectedRoute>
          }
        />

        {/* PONTATOR */}
        <Route
          path="/pontator"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "PONTATOR",
                "ADMINISTRATOR",
              ]}
            >
              <Pontator />
            </RoleProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "ADMINISTRATOR",
              ]}
            >
              <Admin />
            </RoleProtectedRoute>
          }
        />

      </Route>

      {/* fallback */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}