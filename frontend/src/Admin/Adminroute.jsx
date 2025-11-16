import React, { useState,useEffect } from 'react';
import DashboardLayout from './Dashboard-layout.jsx';
import OverviewPage from './Pages/overview.jsx';
import UsersManagementPage from './Pages/Users.jsx';
import TripPlansPage from './Pages/Tripplans.jsx';
import LocalHostsPage from './Pages/Localhostpage.jsx';
import BookingsPage from './Pages/Bookings.jsx';
import TourPartnersPage from './Pages/Tourpartner.jsx';
import ReviewsReportsPage from './Pages/Reports.jsx';
import SettingsPage from './Pages/Settings.jsx';
import api from "../api.js";

function AdminRoute() {
  const [currentPage, setCurrentPage] = useState('overview');

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchStats = async () => {
        try {
          const response = await api.get("/admin/stats/all");
          setStats(response.data); // this contains users, trips, hosts, etc.
        } catch (err) {
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, []);
    console.log(stats);
    

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;


const renderPage = () => {
  switch (currentPage) {
    case "overview":
      return <OverviewPage stats={stats} />;
    case "users":
      return <UsersManagementPage users={stats?.users} />;
    case "trips":
      return <TripPlansPage trips={stats?.trips} />;
    case "hosts":
      return <LocalHostsPage hosts={stats?.hosts} />;
    case "bookings":
      return <BookingsPage bookings={stats?.bookings} />;
    case "partners":
      return <TourPartnersPage partners={stats?.partners} />;
    case "reviews":
      return <ReviewsReportsPage reviews={stats?.reviews} />;
    case "settings":
      return <SettingsPage />; // maybe no stats needed here
    default:
      return <OverviewPage stats={stats} />;
  }
};

  return (
    <DashboardLayout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}

export default AdminRoute;
