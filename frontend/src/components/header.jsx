import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";
import { Bell, X, Check, Shield, Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [memberStatuses, setMemberStatuses] = useState({}); // store member statuses
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const { data } = await API.get("/notifications");
      if (data && data.data) setNotifications(data.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch member statuses for a partnerUp
  const fetchMemberStatuses = async (partnerUpId) => {
    try {
      const { data } = await API.get(`/partnerup/${partnerUpId}/members`);
      const statusMap = {};
      data.data.forEach((m) => {
        statusMap[m._id] = m.status;
      });
      setMemberStatuses((prev) => ({ ...prev, ...statusMap }));
    } catch (err) {
      console.error("Failed to fetch member statuses:", err);
    }
  };

  // Handle accept/reject actions
  const respondToRequest = async (
    partnerUpId,
    memberId,
    notifId,
    action,
    user
  ) => {
    try {
      await API.patch(`/partnerup/${partnerUpId}/member/${memberId}`, {
        action,
        user,
      });
      // Update status locally
      setMemberStatuses((prev) => ({
        ...prev,
        [memberId]: action === "accept" ? "accepted" : "rejected",
      }));
      // Mark notification as read
      await markNotificationRead(notifId);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to respond to request:", err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const openNotifications = async () => {
    setShowNotifications(true);
    // mark all unread as read when opening
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(
      unread.map((n) => API.patch(`/notifications/${n._id}/read`))
    );
    await fetchNotifications();

    // fetch member statuses for all partnerUps in notifications
    const partnerUpIds = [
      ...new Set(notifications.map((n) => n.data.partnerUp)),
    ];
    partnerUpIds.forEach((id) => fetchMemberStatuses(id));
  };

  // Initial fetch + polling every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <>
      <header className="hidden lg:flex w-full items-center fixed top-1 left-1/2 -translate-x-1/2 z-50 backdrop-blur-lg bg-black/60 border border-white/20 rounded-full w-[95%] h-18">
        <div className="max-w-7xl mx-auto px-6 mt-1  flex items-center">
          {/* LEFT — NAVIGATION */}
          <div className="flex-shrink-0 -ml-20 px-3">
            <a href="/HomePage">
              <img
                src="/logoA.png"
                alt="AiVoyager Logo"
                className="h-9 w-auto"
              />
            </a>
          </div>
          <nav className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-white font-medium text-sm sm:text-base ml-0.5">
            {["Destinations", "Mission", "Contact"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  const sectionId = item.toLowerCase();

                  // Check if we're on the homepage
                  if (location.pathname !== "/HomePage") {
                    // Navigate to homepage with hash
                    navigate(`/HomePage#${sectionId}`);
                  } else {
                    // Already on homepage, scroll directly
                    const element = document.getElementById(sectionId);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth" });
                    }
                  }
                }}
                className="hover:text-blue-200 transition whitespace-nowrap bg-transparent"
              >
                {item}
              </button>
            ))}
          </nav>

          {/* RIGHT — Notifications + Profile + Logout */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-end ml-85">
            {/* Admin Button (only for admins) */}
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:opacity-90 transition shadow-md"
                style={{ animation: "iconPopScale 0.6s ease-out 0.15s both" }}
              >
                <Shield size={18} />
                <span className="font-medium hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Dashboard Button (for all logged-in users) */}
            {user && (
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-full hover:opacity-90 transition shadow-md"
                style={{ animation: "iconPopScale 0.6s ease-out 0.2s both" }}
              >
                <span className="font-medium">Dashboard</span>
              </button>
            )}

            {/* Notifications Modal */}
            {showNotifications && (
              <div className="fixed inset-0 flex items-center justify-center z-60 p-4 pt-70">
                <motion.div
                  initial={{ opacity: 0, translateY: 50 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[400px] p-6 flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Scrollable notifications list */}
                  <div className="flex-1 overflow-y-auto space-y-3">
                    {loadingNotifications ? (
                      <div className="text-center py-6">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className="border p-3 rounded-lg flex items-start justify-between gap-3"
                        >
                          {/* Notification content */}
                          <div>
                            <div className="font-semibold">
                              {n.actor?.name || "Someone"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {n.type === "partner_request" && (
                                <>Requested to join: {n.data?.placeName}</>
                              )}
                              {n.type === "partner_response" && (
                                <>
                                  Your request to join{" "}
                                  <strong>{n.data?.placeName}</strong> was{" "}
                                  <span
                                    className={
                                      n.data?.action === "accept"
                                        ? "text-green-600 font-semibold"
                                        : "text-red-600 font-semibold"
                                    }
                                  >
                                    {n.data?.action}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {n.type === "partner_request" &&
                              (() => {
                                const status = memberStatuses[n.data.memberId];
                                if (status === "accepted")
                                  return (
                                    <span className="text-green-600 font-semibold">
                                      Accepted
                                    </span>
                                  );
                                if (status === "rejected")
                                  return (
                                    <span className="text-red-600 font-semibold">
                                      Rejected
                                    </span>
                                  );
                                return (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        respondToRequest(
                                          n.data.partnerUp,
                                          n.data.memberId,
                                          n._id,
                                          "accept",
                                          user
                                        )
                                      }
                                      className="px-3 py-1 bg-teal-500 text-white rounded-md flex items-center gap-2"
                                    >
                                      <Check className="w-4 h-4" /> Accept
                                    </button>
                                    <button
                                      onClick={() =>
                                        respondToRequest(
                                          n.data.partnerUp,
                                          n.data.memberId,
                                          n._id,
                                          "reject",
                                          user
                                        )
                                      }
                                      className="px-3 py-1 border rounded-md text-sm"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                );
                              })()}

                            {n.type === "partner_response" && (
                              <div className="flex gap-1">
                                <button
                                  onClick={async () => {
                                    await markNotificationRead(n._id);
                                    await fetchNotifications();
                                  }}
                                  className="px-3 py-1 bg-gray-100 rounded-md text-sm"
                                >
                                  Dismiss
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Profile Button */}
            <div className="relative">
              <button
                className="flex items-center gap-2 bg-teal-500/80 text-black px-5 py-2.5 rounded-full hover:bg-teal-600 transition shadow-md"
                style={{ animation: "iconPopScale 0.6s ease-out 0.25s both" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span className="font-medium hidden sm:inline">
                  Hello, {user ? user.email.split("@")[0] : "Guest"}
                </span>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="bg-teal-500/80 text-black px-5 py-2.5 rounded-full hover:bg-teal-600 transition shadow-md"
            >
              Logout
            </button>

            {/* Bell (notifications) */}
            <div className="relative">
              <button
                onClick={openNotifications}
                className="relative bg-white p-2 rounded-full shadow-md mr-2"
                title="Notifications"
              >
                <Bell className="w-6 h-6 text-teal-600" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile-only header with just hamburger */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition"
          title="Open menu"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-teal-600" />
        </button>
      </div>

      {/* Mobile drawer/modal (right-side) - Outside header, full screen */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[100] flex h-dvh-full"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileOpen(false)}
        >
          {/* Overlay (left side) */}
          <div className="flex-1 bg-black/60 backdrop-blur-sm" />

          {/* Drawer (right side) */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-[70%] sm:w-[60%] h-[100dvh] p-6 overflow-auto bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full flex flex-col">
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-2 right-2 text-white hover:text-gray-300 transition"
                aria-label="Close menu"
              >
                <X className="w-7 h-7" />
              </button>

              {/* Logo */}
              <div className="flex justify-center mt-8 mb-12">
                <img
                  src="/logoA.png"
                  alt="AiVoyager Logo"
                  className="h-12 w-auto"
                />
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col items-center gap-8 flex-1">
                {["Destinations", "Mission", "Contact"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const sectionId = item.toLowerCase();
                      setMobileOpen(false);
                      if (location.pathname !== "/HomePage") {
                        navigate(`/HomePage#${sectionId}`);
                      } else {
                        const element = document.getElementById(sectionId);
                        if (element)
                          element.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className="text-xl font-medium hover:text-blue-300 transition"
                  >
                    {item}
                  </button>
                ))}

                {/* Admin Button (mobile) */}
                {user?.role === "admin" && (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/admin");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:opacity-90 transition shadow-md mt-4"
                  >
                    <Shield size={20} />
                    <span className="font-medium">Admin</span>
                  </button>
                )}

                {/* Dashboard Button (mobile) */}
                {user && (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/dashboard");
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-full hover:opacity-90 transition shadow-md"
                  >
                    <span className="font-medium">Dashboard</span>
                  </button>
                )}

                {/* Notifications Button (mobile) */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    openNotifications();
                  }}
                  className="relative flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-full hover:bg-gray-100 transition shadow-md"
                >
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">Notifications</span>
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Profile Info (mobile) */}
                <div className="flex items-center gap-2 px-6 py-3 bg-teal-500/20 text-white rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <span className="font-medium">
                    {user ? user.email.split("@")[0] : "Guest"}
                  </span>
                </div>

                {/* Logout Button (mobile) */}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md font-medium"
                >
                  Logout
                </button>
              </nav>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
