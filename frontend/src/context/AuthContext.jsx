import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import {
  getCurrentUser,
  saveAuth as saveAuthToStorage,
  logout as logoutFromStorage,
} from "../utils/auth";
import API from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  // ----------------------
  // Manual login
  // ----------------------
  const login = async (token, userData) => {
    saveAuthToStorage(token, userData);
    setUser(userData);
  };

  const logout = async () => {
    logoutFromStorage();
    setUser(null);
    await supabase.auth.signOut(); // Logout Supabase OAuth users
  };

  // ----------------------
  // Supabase OAuth login
  // ----------------------
  const signInWithOAuth = async (provider) => {
    await supabase.auth.signInWithOAuth({ provider });
    // Redirect handled automatically by Supabase
  };

  // ----------------------
  // Sync Supabase OAuth users to backend MongoDB
  // ----------------------
  const syncSupabaseUser = async (supaUser) => {
    if (!supaUser?.email) return;

    try {
      const res = await API.post("/auth/oauth-login", {
        email: supaUser.email,
        name: supaUser.user_metadata?.full_name || supaUser.email,
      });

      // Save JWT + user to localStorage and context
      saveAuthToStorage(res.data.token, res.data.user);
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to sync Supabase OAuth user:", err);
    }
  };

  // ----------------------
  // Listen to Supabase auth state changes
  // ----------------------
  useEffect(() => {
    const initializeUser = async () => {
      // Load manual login user from localStorage
      const storedUser = getCurrentUser();
      setUser(storedUser);

      // Load Supabase session (if OAuth user)
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await syncSupabaseUser(data.session.user);
      }
      setLoading(false);
    };

    initializeUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await syncSupabaseUser(session.user);
        } else {
          // Supabase logout
          setUser(getCurrentUser());
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, signInWithOAuth, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
