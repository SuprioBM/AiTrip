import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import DataTable from "../../components/ui/data-table";

// Mock bookings data
const bookingsData = [
  { id: "BK001", user: "Sarah Anderson", host: "Marco Rossi", date: "2024-03-15", status: "Confirmed", payment: "Paid", amount: "$250" },
  { id: "BK002", user: "Mike Johnson", host: "Yuki Tanaka", date: "2024-03-20", status: "Pending", payment: "Pending", amount: "$320" },
  { id: "BK003", user: "Emily Chen", host: "Sophie Dubois", date: "2024-02-28", status: "Completed", payment: "Paid", amount: "$180" },
  { id: "BK004", user: "Alex Rivera", host: "Carlos Mendez", date: "2024-03-10", status: "Cancelled", payment: "Refunded", amount: "$150" },
  { id: "BK005", user: "Jessica Lee", host: "Priya Sharma", date: "2024-03-25", status: "Confirmed", payment: "Paid", amount: "$220" },
];

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredBookings = bookingsData.filter(
    (booking) =>
      (booking.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.host.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || booking.status === filterStatus)
  );

  const columns = [
    { key: "id", label: "Booking ID" },
    { key: "user", label: "User" },
    { key: "host", label: "Host" },
    { key: "date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (status) => {
        const statusColors = {
          Confirmed: "bg-blue-100 text-blue-700",
          Pending: "bg-yellow-100 text-yellow-700",
          Completed: "bg-green-100 text-green-700",
          Cancelled: "bg-red-100 text-red-700",
        };
        return (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "payment",
      label: "Payment",
      render: (payment) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            payment === "Paid"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {payment}
        </span>
      ),
    },
    { key: "amount", label: "Amount" },
  ];

  const actions = [
    {
      label: "View",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: (booking) => console.log("View:", booking),
    },
    {
      label: "Modify",
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      onClick: (booking) => console.log("Modify:", booking),
    },
    {
      label: "Cancel",
      className: "bg-red-100 text-red-700 hover:bg-red-200",
      onClick: (booking) => console.log("Cancel:", booking),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Bookings Management</h1>
        <p className="text-muted-foreground">Track and manage all platform bookings.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by user or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-8"
          >
            <option value="all">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <ChevronDown
            className="absolute right-2 top-2.5 text-muted-foreground pointer-events-none"
            size={18}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredBookings} actions={actions} />
    </div>
  );
}
