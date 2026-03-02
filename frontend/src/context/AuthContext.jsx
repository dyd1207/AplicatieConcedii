import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { meRequest } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || "");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isAuthenticated = !!accessToken;

  useEffect(() => {
    // La refresh, dacă avem token, încercăm să luăm user-ul din backend (/auth/me)
    async function bootstrap() {
      try {
        const raw = localStorage.getItem("user");
        if (raw) setUser(JSON.parse(raw));

        if (accessToken) {
          const me = await meRequest();
          setUser(me);
          localStorage.setItem("user", JSON.stringify(me));
        }
      } catch {
        // token invalid/expirat -> logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setAccessToken("");
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = ({ token, user }) => {
    setAccessToken(token);
    setUser(user);
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setAccessToken("");
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const value = useMemo(
    () => ({ user, accessToken, isAuthenticated, isAuthLoading, login, logout }),
    [user, accessToken, isAuthenticated, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}