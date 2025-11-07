import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  saveAuth as saveAuthToStorage,
  logout as logoutFromStorage,
} from "../utils/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  const login = async (token, userData) => {
    saveAuthToStorage(token, userData);
    setUser(userData);
  };

  const logout = () => {
    logoutFromStorage();
    setUser(null);
  };

  useEffect(() => {
    // Check token expiration or refresh token here if needed
    const user = getCurrentUser();
    setUser(user);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};