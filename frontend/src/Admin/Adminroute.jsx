import React, { useState } from "react";
import DashboardLayout from "./Dashboard-layout.jsx";
import OverviewPage from "./Pages/overview.jsx";
import UsersManagementPage from "./Pages/Users.jsx";
import TripPlansPage from "./Pages/Tripplans.jsx";
import LocalHostsPage from "./Pages/Localhostpage.jsx";
import BookingsPage from "./Pages/Bookings.jsx";
import TourPartnersPage from "./Pages/Tourpartner.jsx";
import ReviewsReportsPage from "./Pages/Reports.jsx";
import SettingsPage from "./Pages/Settings.jsx";
import { useAdmin } from "../context/AdminContext.jsx";

function AdminRoute() {
  const [currentPage, setCurrentPage] = useState("overview");
  const { loading, error } = useAdmin();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <OverviewPage />;
      case "users":
        return <UsersManagementPage />;
      case "trips":
        return <TripPlansPage />;
      case "hosts":
        return <LocalHostsPage />;
      case "bookings":
        return <BookingsPage />;
      case "partners":
        return <TourPartnersPage />;
      case "reviews":
        return <ReviewsReportsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}

export default AdminRoute;
