import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/Login.jsx";
import OAuthCallback from "./pages/Auth/Oauth.jsx";
import Dashboard from "./pages/Dashboard/dashboard.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth" element={<OAuthCallback />} />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
