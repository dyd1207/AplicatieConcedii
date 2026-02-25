import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // ex: { id, fullName, roles: [] }
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || "");

  const isAuthenticated = !!accessToken;

  useEffect(() => {
    // Dacă ai și user în localStorage, îl putem reîncărca
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
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
    () => ({ user, accessToken, isAuthenticated, login, logout }),
    [user, accessToken, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}