import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage admin panel settings and preferences.
        </p>
      </div>

      {/* Account Settings */}
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Account Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Admin Email
            </label>
            <input
              type="email"
              defaultValue={user?.email || ""}
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <input
              type="password"
              defaultValue={user ? "********" : ""}
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

  

      {/* Preferences */}
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Preferences
        </h2>

        <div className="space-y-4">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">
                Email Notifications
              </label>
              <p className="text-xs text-muted-foreground">
                Receive alerts for important actions
              </p>
            </div>

            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                emailNotifications ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  emailNotifications ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Dark Mode Toggle (disabled) */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-foreground">
                Dark Mode
              </label>
              <p className="text-xs text-muted-foreground">
                Coming soon - Enable dark theme
              </p>
            </div>

            <button
              disabled
              className="relative w-12 h-6 rounded-full bg-gray-300 cursor-not-allowed"
            >
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-lg transition-all duration-200">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Permissions
        </h2>

        <div className="space-y-3">
          {[
            "View All Data",
            "Manage Users",
            "Manage Bookings",
            "Delete Content",
          ].map((label, i) => (
            <label
              key={i}
              className="flex items-center gap-3 cursor-pointer p-3 hover:bg-secondary rounded-lg transition-colors duration-200"
            >
              <input
                type="checkbox"
                defaultChecked={i < 3}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium">
          Save Changes
        </button>
      </div>
    </div>
  );
}
