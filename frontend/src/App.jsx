import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import { VerifyPage } from "./pages/Auth/VerifyPage";
import Dashboard from "./pages/Dashboard";
import TripPlanner from "./pages/TripPlanner";
import HostsPage from "./pages/HostsPage";
import PartnersPage from "./pages/PartnersPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

export default function App() {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading...</div>;


  return (
    <div className="app-shell">
      <Navbar user={user} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/planner" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/planner" element={<TripPlanner />} />
          <Route path="/hosts" element={<HostsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route
            path="/dashboard"
            element={
              user ? <Dashboard user={user} /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
