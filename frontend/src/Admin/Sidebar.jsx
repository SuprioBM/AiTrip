import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Home,
  Calendar,
  Users2,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users Management", icon: Users },
  { id: "trips", label: "Trip Plans", icon: MapPin },
  { id: "hosts", label: "Local Hosts", icon: Home },
  { id: "partners", label: "Tour Partners", icon: Users2 },
  { id: "reviews", label: "Reviews & Reports", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings }
];

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle }) {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-accent rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 md:hidden z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-card border-r border-border overflow-y-auto transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">AITrip</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="p-4 border-b border-border">
          <button
            onClick={() => navigate("/HomePage")}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span className="font-medium text-sm">Back to Home</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  if (window.innerWidth < 768) onToggle(); // Auto close for mobile
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-accent text-foreground hover:bg-accent/80 transition-colors duration-200">
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
