import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { AdminProvider } from "./context/AdminContext.jsx";
import { Toaster } from "sonner";

import LoginPage from "./pages/Auth/Login.jsx";
import OAuthCallback from "./pages/Auth/Oauth.jsx";
import HomePage from "./pages/Home/Home.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import AdminRoute from "./Admin/Adminroute.jsx";
import DetailsPage from "./pages/detailsPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";

import MainLayout from "./layouts/layout_1.jsx";
import EmptyLayout from "./layouts/layout_0.jsx";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // ✅ Wait for auth

  return (
    <>
      <Toaster position="top-right" richColors duration={4000} />

      <Routes>
        {/* Routes without header/footer */}
        <Route element={<EmptyLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth" element={<OAuthCallback />} />
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
        </Route>

        {/* Routes with header/footer */}
        <Route element={<MainLayout />}>
          <Route
            path="/HomePage"
            element={user ? <HomePage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/booking"
            element={user ? <BookingPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/details"
            element={user ? <DetailsPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/reviews"
            element={user ? <ReviewPage /> : <Navigate to="/login" replace />}
          />

        </Route>
      </Routes>
    </>
  );
};

export default App;
