import React from "react";
import { Search, Bell, Menu, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopNav({ onMenuToggle }) {
  const navigate = useNavigate();

  return (
    <header className="bg-card border-b border-border px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left - Menu Toggle + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 hover:bg-accent rounded-lg"
          >
            <Menu size={20} />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <Home size={18} />
            <span className="text-sm font-medium">Home</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-lg flex-1 max-w-md">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users, trips, bookings..."
              className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Right - Notifications + Profile */}
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <button className="relative p-2 hover:bg-accent rounded-lg transition-colors duration-200">
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-lg transition-colors duration-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AB</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">admin@aitrip.com</p>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
}
