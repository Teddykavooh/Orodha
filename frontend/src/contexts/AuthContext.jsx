import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

/**
 * AuthContext
 * Provides authentication state (token and user) and helpers.
 * - `login(credentials)` performs POST /api/auth/login/ and stores token
 * - `logout()` clears token and user
 * The provider stores token in localStorage so the session survives reloads.
 */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      api.setToken(token);
      // fetch /api/auth/me/ to populate user
      api.get("/auth/me/").then((res) => setUser(res.data)).catch(() => setUser(null));
    } else {
      localStorage.removeItem("token");
      api.setToken(null);
      setUser(null);
    }
  }, [token]);

  async function login({ username, password }) {
    const res = await api.post("/auth/login/", { username, password });
    const t = res.data.token;
    setToken(t);
    return res;
  }

  function logout() {
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
