import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Home,
  Users2,
  Menu as MenuIcon,
  LogOut,
  ChevronRight,
  TrendingUp,
  Plane,
  Hotel,
  DollarSign,
  Plus,
  Calendar,
  Search,
  Star,
  X,
} from "lucide-react";
import API from "../../api";

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="text-slate-400" size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// DataTable Component
const DataTable = ({ columns, data, actions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 text-slate-400 text-sm font-medium"
              >
                {col.label}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-700/50 hover:bg-slate-700/30"
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-white text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {actions.map((action, actionIdx) => (
                      <button
                        key={actionIdx}
                        onClick={() => action.onClick(row)}
                        className={`px-3 py-1 rounded text-xs font-medium transition ${action.className}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function UserDashboard() {
  // ===== AUTHENTICATION & NAVIGATION =====
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ===== STATE MANAGEMENT =====
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewSearchTerm, setReviewSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    completedTrips: 0,
    totalSpent: 0,
  });

  const [recentTrips, setRecentTrips] = useState([]);
  const [localhosts, setLocalhosts] = useState([]);
  const [partnerUps, setPartnerUps] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    phone: user?.phone || "",
    age: user?.age || "",
  });

  // Localhost assignment modal states
  const [localhostModalOpen, setLocalhostModalOpen] = useState(false);
  const [selectedTripForLocalhost, setSelectedTripForLocalhost] =
    useState(null);
  const [availableLocalhosts, setAvailableLocalhosts] = useState([]);
  const [loadingLocalhosts, setLoadingLocalhosts] = useState(false);

  // ===== FETCH DASHBOARD DATA =====
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await API.get("/trips");
      const trips = data.trips || [];

      const upcoming = trips.filter(
        (t) => t.startDate && new Date(t.startDate) > new Date()
      );
      const completed = trips.filter(
        (t) => t.endDate && new Date(t.endDate) < new Date()
      );

      setStats({
        totalTrips: trips.length,
        upcomingTrips: upcoming.length,
        completedTrips: completed.length,
        totalSpent: trips.reduce((sum, t) => sum + (t.budget || 0), 0),
      });

      setRecentTrips(trips.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  // ===== FETCH LOCALHOSTS =====
  const fetchLocalhosts = async () => {
    try {
      const { data } = await API.get("/trips");
      const trips = data.trips || [];

      const uniqueLocalhosts = [];
      const seenIds = new Set();

      for (const trip of trips) {
        if (trip.localhost && !seenIds.has(trip.localhost)) {
          seenIds.add(trip.localhost);
          uniqueLocalhosts.push({
            _id: trip.localhost,
            name: trip.localhostName || trip.localhost,
            locationName: trip.locationName,
            email: null,
          });
        }
      }

      setLocalhosts(uniqueLocalhosts);
    } catch (error) {
      console.error("Failed to fetch localhosts:", error);
    }
  };

  // ===== FETCH PARTNER UPS =====
  const fetchPartnerUps = async () => {
    try {
      const { data } = await API.get("/partner-ups/partnerUpmembers", {
        params: { userId: user.id },
      });
      setPartnerUps(data.data || []);
    } catch (error) {
      console.error("Failed to fetch partner ups:", error);
    }
  };

  // ===== FETCH AVAILABLE LOCALHOSTS FOR ASSIGNMENT =====
  const fetchAvailableLocalhosts = async (destination) => {
    setLoadingLocalhosts(true);
    try {
      const locationCode = destination?.substring(0, 3).toLowerCase() || "";
      if (!locationCode) {
        setAvailableLocalhosts([]);
        return;
      }

      const { data } = await API.get(`/hosts/${locationCode}`);
      setAvailableLocalhosts(data.hosts || []);
    } catch (error) {
      console.error("Failed to fetch available localhosts:", error);
      setAvailableLocalhosts([]);
    } finally {
      setLoadingLocalhosts(false);
    }
  };

  // ===== ASSIGN LOCALHOST TO TRIP =====
  const assignLocalhostToTrip = async (localhostId, localhostName) => {
    try {
      await API.put(`/trips/${selectedTripForLocalhost._id}/localhost`, {
        localhostId,
        localhostName,
      });

      await fetchDashboardData();
      setLocalhostModalOpen(false);
      setSelectedTripForLocalhost(null);
      setAvailableLocalhosts([]);
      alert("Localhost assigned successfully!");
    } catch (error) {
      console.error("Failed to assign localhost:", error);
      alert("Failed to assign localhost. Please try again.");
    }
  };

  // ===== FETCH REVIEWS BY USER ID =====
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserReviews = async () => {
      try {
        const { data } = await API.get("/reviews/getreviewbyid", {
          params: { userId: user.id },
        });

        if (data.success && Array.isArray(data.reviews)) {
          setUserReviews(data.reviews);
        } else {
          setUserReviews([]);
        }
      } catch (error) {
        console.error("Failed to fetch user reviews:", error);
        setUserReviews([]);
      }
    };

    fetchUserReviews();
  }, [user?.id]);

  // ===== FILTERED REVIEWS =====
  const filteredUserReviews = (userReviews || []).filter(
    (r) =>
      r.comment?.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
      r.locationName?.toLowerCase().includes(reviewSearchTerm.toLowerCase())
  );

  // ===== REVIEWS COLUMNS =====
  const reviewColumns = [
    {
      key: "location",
      label: "Location",
      render: (_, row) => row.locationName || "-",
    },
    {
      key: "comment",
      label: "Comment",
      render: (_, row) => (
        <span className="line-clamp-2">{row.comment || "-"}</span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span>{row.rating || "-"}</span>
        </div>
      ),
    },
    {
      key: "verified",
      label: "Verified",
      render: (_, row) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            row.verified
              ? "bg-green-500/20 text-green-400"
              : "bg-slate-500/20 text-slate-400"
          }`}
        >
          {row.verified ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (_, row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const reviewActions = [
    {
      label: "View Details",
      className: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
      onClick: (row) => {
        setSelectedReview(row);
        setReviewModalOpen(true);
      },
    },
  ];

  // ===== RENDER USER REVIEWS =====
  const renderUserReviews = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">My Reviews</h2>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by location or comment..."
            value={reviewSearchTerm}
            onChange={(e) => setReviewSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {filteredUserReviews.length > 0 ? (
          <DataTable
            columns={reviewColumns}
            data={filteredUserReviews}
            actions={reviewActions}
          />
        ) : (
          <p className="text-slate-400 text-center py-6">No reviews found</p>
        )}
      </div>

      {/* Review Details Modal */}
      <Modal
        isOpen={reviewModalOpen}
        title="Review Details"
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedReview(null);
        }}
      >
        {selectedReview && (
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-xs uppercase mb-1">Location</p>
              <p className="text-white font-medium">
                {selectedReview.locationName || "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase mb-1">Comment</p>
              <p className="text-white font-medium">
                {selectedReview.comment || "-"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase mb-1">Rating</p>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < (selectedReview.rating || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-600"
                    }
                  />
                ))}
                <span className="text-white font-medium ml-2">
                  {selectedReview.rating || 0}/5
                </span>
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase mb-1">Verified</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm ${
                  selectedReview.verified
                    ? "bg-green-500/20 text-green-400"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {selectedReview.verified ? "Verified" : "Not Verified"}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase mb-1">Date</p>
              <p className="text-white font-medium">
                {new Date(selectedReview.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  // ===== OPEN LOCALHOST ASSIGNMENT MODAL =====
  const openLocalhostModal = (trip) => {
    setSelectedTripForLocalhost(trip);
    setLocalhostModalOpen(true);
    fetchAvailableLocalhosts(trip.destination || trip.locationName);
  };

  useEffect(() => {
    if (activeMenu === "localhost") {
      fetchLocalhosts();
    } else if (activeMenu === "partnerup") {
      fetchPartnerUps();
    }
  }, [activeMenu]);

  // ===== UPDATE PROFILE =====
  const handleUpdateProfile = async () => {
    try {
      await API.put("/users/me", profileData);
      alert("Profile updated successfully!");
      setEditModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    }
  };

  // ===== SIDEBAR MENU ITEMS =====
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trips", label: "My Trips", icon: MapPin },
    { id: "localhost", label: "Local Hosts", icon: Hotel },
    { id: "partnerup", label: "Partner Up", icon: Users2 },
    { id: "reviews", label: "My Reviews", icon: Star },
  ];

  // ===== RENDER CONTENT =====
  const renderContent = () => {
    switch (activeMenu) {
      case "trips":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My Trips</h2>
              <button
                onClick={() => navigate("/booking")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition"
              >
                <Plus size={20} />
                Make a Trip
              </button>
            </div>
            {recentTrips.length > 0 ? (
              recentTrips.map((trip, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {trip.destination || trip.locationName || "Trip"}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {trip.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {new Date(trip.startDate).toLocaleDateString()}
                            {trip.endDate &&
                              ` - ${new Date(
                                trip.endDate
                              ).toLocaleDateString()}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <DollarSign size={16} />${trip.budget || 0}
                        </span>
                      </div>
                    </div>
                    {trip.startDate && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          new Date(trip.startDate) > new Date()
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {new Date(trip.startDate) > new Date()
                          ? "Upcoming"
                          : "Completed"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-4 relative">
                      <p className="text-slate-400 text-xs mb-2">Local Host</p>
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold">
                          {trip.localhostName ||
                            trip.localhost ||
                            "Not assigned"}
                        </p>
                        <button
                          onClick={() => openLocalhostModal(trip)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg transition"
                          title="Assign Localhost"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-2">Duration</p>
                      <p className="text-white font-semibold">
                        {trip.numberOfDays || 0} days
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">No trips yet</p>
                <button
                  onClick={() => navigate("/booking")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition"
                >
                  Create Your First Trip
                </button>
              </div>
            )}
          </div>
        );

      case "localhost":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              My Local Hosts
            </h2>
            {localhosts.length > 0 ? (
              localhosts.map((host, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center">
                      <Hotel className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">
                        {host.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {host.locationName}
                      </p>
                      <p className="text-slate-500 text-xs">ID: {host._id}</p>
                    </div>
                    {host.email && (
                      <div className="text-right">
                        <p className="text-slate-400 text-xs">Contact</p>
                        <p className="text-white text-sm">{host.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-12">
                No local hosts added to your trips yet
              </p>
            )}
          </div>
        );

      case "partnerup":
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">
              My Partner Ups
            </h2>
            {partnerUps.length > 0 ? (
              partnerUps.map((partner, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <Users2 className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {partner.placeName}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {partner.locationName || "Location"}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {partner.members?.length || 0} / {partner.maxMembers}{" "}
                          members
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        partner.status === "open"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {partner.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-12">
                No partner ups yet
              </p>
            )}
          </div>
        );

      case "reviews":
        return renderUserReviews();

      default:
        return (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4">
                <MapPin className="text-white/80 mb-2" size={24} />
                <p className="text-2xl font-bold text-white">
                  {stats.totalTrips}
                </p>
                <p className="text-blue-100 text-xs">Total Trips</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4">
                <Calendar className="text-white/80 mb-2" size={24} />
                <p className="text-2xl font-bold text-white">
                  {stats.upcomingTrips}
                </p>
                <p className="text-teal-100 text-xs">Upcoming</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4">
                <TrendingUp className="text-white/80 mb-2" size={24} />
                <p className="text-2xl font-bold text-white">
                  {stats.completedTrips}
                </p>
                <p className="text-purple-100 text-xs">Completed</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4">
                <DollarSign className="text-white/80 mb-2" size={24} />
                <p className="text-2xl font-bold text-white">
                  ${stats.totalSpent}
                </p>
                <p className="text-orange-100 text-xs">Total Spent</p>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Recent Trips</h2>
                <button
                  onClick={() => setActiveMenu("trips")}
                  className="text-blue-400 text-sm hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {recentTrips.length > 0 ? (
                  recentTrips.slice(0, 3).map((trip, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center">
                        <Hotel className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {trip.destination || trip.locationName || "Trip"}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {trip.numberOfDays || 0} days • ${trip.budget || 0}
                        </p>
                      </div>
                      {trip.startDate && (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                          {new Date(trip.startDate) > new Date()
                            ? "Upcoming"
                            : "Completed"}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">No trips yet</p>
                    <button
                      onClick={() => navigate("/booking")}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition mx-auto"
                    >
                      <Plus size={18} />
                      Make a Trip
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        <MenuIcon size={24} />
      </button>

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700 transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Plane className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">AITrip</h1>
              <p className="text-xs text-slate-400">Travel Dashboard</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {user?.name || user?.email?.split("@")[0]}
              </p>
              <button
                onClick={() => setEditModalOpen(true)}
                className="text-slate-400 text-xs hover:text-blue-400"
              >
                Edit Account Info
              </button>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <button
            onClick={() => navigate("/HomePage")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-all"
          >
            <Home size={20} />
            <span className="text-sm font-medium">Home</span>
          </button>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <span>Home</span>
            <ChevronRight size={16} />
            <span>User</span>
            <ChevronRight size={16} />
            <span className="text-white">User Profile</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                User Profile
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase">Traveler</p>
                <p className="text-white font-bold text-lg">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Personal Info
              </h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-4xl">
                    {user?.name?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">
                      Name
                    </p>
                    <p className="text-white font-semibold">
                      {user?.name || "Not Set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">
                      Phone
                    </p>
                    <p className="text-white font-semibold">
                      {user?.phone || "Not Set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">
                      Email Address
                    </p>
                    <p className="text-white font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs uppercase mb-1">Age</p>
                    <p className="text-white font-semibold">
                      {user?.age || "Not Set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {renderContent()}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h2 className="text-white text-sm font-semibold mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/booking")}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Make a Trip
                </button>
                <button
                  onClick={() => setActiveMenu("trips")}
                  className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg text-sm text-left flex items-center justify-between transition"
                >
                  <span>View All Trips</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setActiveMenu("localhost")}
                  className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg text-sm text-left flex items-center justify-between transition"
                >
                  <span>Local Hosts</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setActiveMenu("partnerup")}
                  className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg text-sm text-left flex items-center justify-between transition"
                >
                  <span>Partner Ups</span>
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setActiveMenu("reviews")}
                  className="w-full px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg text-sm text-left flex items-center justify-between transition"
                >
                  <span>My Reviews</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Name
                </label>
                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg cursor-not-allowed"
                />
                <p className="text-slate-500 text-xs mt-1">
                  Name cannot be changed
                </p>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Age</label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) =>
                    setProfileData({ ...profileData, age: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter age"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:opacity-90 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Localhost Assignment Modal */}
      {localhostModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-2xl font-bold text-white">
                Assign Local Host
              </h3>
              <p className="text-slate-400 mt-2">
                {selectedTripForLocalhost?.locationName ||
                  selectedTripForLocalhost?.destination}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {loadingLocalhosts ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Loading local hosts...</p>
                </div>
              ) : availableLocalhosts.length > 0 ? (
                availableLocalhosts.map((host) => (
                  <div
                    key={host._id}
                    className="bg-slate-700/30 border border-slate-600 rounded-xl p-4 hover:border-blue-500 transition cursor-pointer"
                    onClick={() => assignLocalhostToTrip(host._id, host.name)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center">
                        <Hotel className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white">
                          {host.name}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {host.locationName}
                        </p>
                        <p className="text-slate-500 text-xs">ID: {host._id}</p>
                      </div>
                      <div className="text-right">
                        {host.email && (
                          <p className="text-slate-400 text-sm">{host.email}</p>
                        )}
                        {host.phone && (
                          <p className="text-slate-400 text-xs">{host.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">
                    No local hosts available for this location
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-4">
              <button
                onClick={() => {
                  setLocalhostModalOpen(false);
                  setSelectedTripForLocalhost(null);
                  setAvailableLocalhosts([]);
                }}
                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
