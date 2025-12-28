import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { Bell, X, Check, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [memberStatuses, setMemberStatuses] = useState({}); // store member statuses

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
    <header className="fixed top-1 left-1/2 -translate-x-1/2 z-50 backdrop-blur-lg bg-black/60 border border-white/20 rounded-full w-[95%] h-18">
      <div className="max-w-7xl mx-auto px-6 mt-3  flex items-center">
        {/* LEFT — NAVIGATION */}
          <div className="flex-shrink-0 -ml-20 px-3">
            <a href="/HomePage">
            <img
              src="/logoA.png" // replace with your logo file path
              alt="AiVoyager Logo"
              className="h-9 w-auto" // 40px height, auto width
            /></a>
          </div>
        <nav className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-white font-medium text-sm sm:text-base ml-0.5">
          {["Destinations", "Mission", "Contact"].map((item, idx) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                document
                  .getElementById(item.toLowerCase())
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-blue-200 transition whitespace-nowrap bg-transparent"
              style={{
                animation: `navItemSlideDown 0.5s ease-out ${
                  0.1 + idx * 0.06
                }s both`,
              }}
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
            <div className="fixed inset-0 flex items-center justify-center z-60 p-4 pt-30">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Notifications</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-auto">
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
  );
}
