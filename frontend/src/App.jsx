import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Auth/Login.jsx";
import OAuthCallback from "./pages/Auth/Oauth.jsx";
// import Dashboard from "./pages/Dashboard/dashboard.jsx";

import AdminRoute from "./Admin/Adminroute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { Toaster } from "sonner";
import BookingPage from './pages/BookingPage.jsx';
import HomePage from './pages/Home/Home'

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Toaster position="top-right" richColors duration={4000} />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/HomePage" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth" element={<OAuthCallback />} />
        <Route
          path="/HomePage"
          element={user ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/booking"
          element={user ? <BookingPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={
            user ? (
              <AdminProvider>
                <AdminRoute />
              </AdminProvider>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;


