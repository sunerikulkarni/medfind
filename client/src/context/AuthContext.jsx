import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("medfind_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem("medfind_role") || null);
  const [loading, setLoading] = useState(false);

  const persist = (token, user, role) => {
    localStorage.setItem("medfind_token", token);
    localStorage.setItem("medfind_user", JSON.stringify(user));
    localStorage.setItem("medfind_role", role);
    setUser(user);
    setRole(role);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persist(data.token, data.user, data.role);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerPatient = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", payload);
      persist(data.token, data.user, data.role);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerPharmacy = useCallback(async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/pharmacies/register", payload);
      persist(data.token, data.user, data.role);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("medfind_token");
    localStorage.removeItem("medfind_user");
    localStorage.removeItem("medfind_role");
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role, loading, login, registerPatient, registerPharmacy, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
