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
import RoleProtectedRoute from "./RoleProtectedRoute";
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
        <Route path="/rapoarte" element={<Rapoarte />} />

        <Route
          path="/avizare"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "SEF_STRUCTURA",
                "SEF",
                "PONTATOR",
                "DIRECTOR_ADJUNCT",
                "DIRECTOR",
                "DIRECTOR_GENERAL",
                "ADMINISTRATOR",
                "ADMIN",
              ]}
            >
              <Avizare />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/aprobare"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "SEF_STRUCTURA",
                "SEF",
                "PONTATOR",
                "DIRECTOR_ADJUNCT",
                "DIRECTOR",
                "DIRECTOR_GENERAL",
                "ADMINISTRATOR",
                "ADMIN",
              ]}
            >
              <Aprobare />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/secretariat"
          element={
            <RoleProtectedRoute
              allowedRoles={[
                "SECRETARIAT",
                "SEF_STRUCTURA",
                "SEF",
                "PONTATOR",
                "DIRECTOR_ADJUNCT",
                "DIRECTOR",
                "DIRECTOR_GENERAL",
                "ADMINISTRATOR",
                "ADMIN",
              ]}
            >
              <Secretariat />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/pontator"
          element={
            <RoleProtectedRoute allowedRoles={["PONTATOR", "ADMINISTRATOR", "ADMIN"]}>
              <Pontator />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["ADMINISTRATOR", "ADMIN"]}>
              <Admin />
            </RoleProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}