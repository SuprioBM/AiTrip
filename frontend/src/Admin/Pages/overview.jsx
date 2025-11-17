import React,{useState} from "react";
import { Users, MapPin, Home, Calendar, Users2 } from "lucide-react";
import StatCard from "../../components/ui/stat-card";
import ChartCard from "../../components/ui/chart-card";
import { useAdmin } from "../../context/AdminContext";

// Chart Components
const TripsChartData = () => (
  <div className="space-y-4">
    <div className="flex items-end gap-2 h-48">
      {[45, 52, 48, 65, 72, 58, 85, 90, 78, 88, 95, 92].map((val, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 hover:scale-105"
          style={{ height: `${(val / 100) * 160}px` }}
        />
      ))}
    </div>
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Jan</span>
      <span>Dec</span>
    </div>
  </div>
);

const BookingGrowthChart = () => (
  <div className="space-y-4">
    <div className="flex items-end gap-2 h-48">
      {[30, 40, 35, 55, 65, 75, 85, 92, 88, 95, 102, 110].map((val, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all duration-300 hover:scale-105"
          style={{ height: `${(val / 120) * 160}px` }}
        />
      ))}
    </div>
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Jan</span>
      <span>Dec</span>
    </div>
  </div>
);

const UserSignupTrendChart = () => (
  <div className="space-y-4">
    <div className="flex items-end gap-2 h-48">
      {[20, 28, 25, 32, 45, 52, 60, 68, 75, 82, 88, 95].map((val, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-300 hover:scale-105"
          style={{ height: `${(val / 100) * 160}px` }}
        />
      ))}
    </div>
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Jan</span>
      <span>Dec</span>
    </div>
  </div>
);

// Mock Activity Data
const activityData = [
  { id: 1, type: "User Signup", description: "Sarah Anderson joined the platform", time: "2 minutes ago" },
  { id: 2, type: "New Booking", description: "Booking #2847 created - Paris Tour", time: "15 minutes ago" },
  { id: 3, type: "Partner Request", description: "Tour Guide certification approved", time: "1 hour ago" },
  { id: 4, type: "Host Onboarded", description: "New local host from Tokyo registered", time: "3 hours ago" },
];

export default function OverviewPage() {
  const { stats } = useAdmin();
  const statsData = {
    totalUsers: stats?.users?.length || 0,
    verifiedUsers: stats?.users?.filter((u) => u.isVerified)?.length || 0,
    totalTrips: stats?.trips?.length || 0,
    activeBookings: stats?.bookings?.length || 0,
    totalHosts: stats?.hosts?.length || 0,
    tourPartners: stats?.partners?.length || 0,
  };
  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your AITrip ecosystem at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={statsData.totalUsers}
            change={12}
            icon={Users}
            color="blue"
          />

          <StatCard
            title="Verified Users"
            value={statsData.verifiedUsers}
            change={18}
            icon={Users}
            color="teal"
          />

          <StatCard
            title="Total Trips"
            value={statsData.totalTrips}
            change={25}
            icon={MapPin}
            color="purple"
          />

          <StatCard
            title="Active Bookings"
            value={statsData.activeBookings}
            change={8}
            icon={Calendar}
            color="orange"
          />

          <StatCard
            title="Total Hosts"
            value={statsData.totalHosts}
            change={15}
            icon={Home}
            color="blue"
          />

          <StatCard
            title="Tour Partners"
            value={statsData.tourPartners}
            change={22}
            icon={Users2}
            color="teal"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Trips Generated (Monthly)">
          <TripsChartData />
        </ChartCard>

        <ChartCard title="Booking Growth">
          <BookingGrowthChart />
        </ChartCard>

        <ChartCard title="User Signup Trends">
          <UserSignupTrendChart />
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-xl transition-all duration-300">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

        <div className="space-y-4">
          {activityData.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0 hover:bg-muted/30 rounded-md p-2 transition-all duration-200"
            >
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 mt-2" />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
