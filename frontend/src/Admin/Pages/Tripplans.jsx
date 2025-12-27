import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";
import { useAdmin } from "../../context/AdminContext";

// Mock trip data
const tripsData = [
  { id: "TP001", user: "Sarah Anderson", destination: "Paris, France", budget: "$2,500", generated: "2024-02-15", duration: "7 days" },
  { id: "TP002", user: "Mike Johnson", destination: "Tokyo, Japan", budget: "$3,200", generated: "2024-02-14", duration: "10 days" },
  { id: "TP003", user: "Emily Chen", destination: "Barcelona, Spain", budget: "$1,800", generated: "2024-02-13", duration: "5 days" },
  { id: "TP004", user: "Alex Rivera", destination: "Bangkok, Thailand", budget: "$1,500", generated: "2024-02-12", duration: "8 days" },
  { id: "TP005", user: "Jessica Lee", destination: "Rome, Italy", budget: "$2,200", generated: "2024-02-11", duration: "6 days" },
];

export default function TripPlansPage() {
  const { stats } = useAdmin();
  const tripsData = stats?.trips || [];
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrips = tripsData.filter(
    (trip) => {
      const userName = trip.user?.name || trip.user?.email || '';
      const destination = trip.destination || trip.locationName || '';
      return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             destination.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );

  const handleViewItinerary = (trip) => {
    setSelectedTrip(trip);
    setModalOpen(true);
  };

  const columns = [
    { 
      key: "_id", 
      label: "Trip ID",
      render: (value) => value?.substring(0, 8) || "N/A"
    },
    { 
      key: "user", 
      label: "User",
      render: (value) => value?.name || value?.email || "N/A"
    },
    { 
      key: "destination", 
      label: "Destination",
      render: (value, trip) => value || trip.locationName || "N/A"
    },
    { 
      key: "localhostName", 
      label: "Local Host",
      render: (value, trip) => value || trip.localhost || "Not assigned"
    },
    { 
      key: "budget", 
      label: "Budget",
      render: (value) => value ? `$${value}` : "N/A"
    },
    { 
      key: "numberOfDays", 
      label: "Duration",
      render: (value) => value ? `${value} days` : "N/A"
    },
    { 
      key: "createdAt", 
      label: "Created",
      render: (value) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
  ];

  const actions = [
    {
      label: "View Itinerary",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: handleViewItinerary,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Trip Plans</h1>
        <p className="text-muted-foreground">View all AI-generated travel itineraries.</p>
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search by user or destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Trips Table */}
      <DataTable columns={columns} data={filteredTrips} actions={actions} />

      {/* Itinerary Modal */}
      <Modal
        isOpen={modalOpen}
        title="Trip Itinerary"
        onClose={() => setModalOpen(false)}
      >
        {selectedTrip && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Trip ID</label>
                <p className="text-foreground font-medium">{selectedTrip._id?.substring(0, 8) || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">User</label>
                <p className="text-foreground font-medium">{selectedTrip.user?.name || selectedTrip.user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Destination</label>
                <p className="text-foreground font-medium">{selectedTrip.destination || selectedTrip.locationName || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Budget</label>
                <p className="text-foreground font-medium">{selectedTrip.budget ? `$${selectedTrip.budget}` : "N/A"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
                <p className="text-foreground font-medium">
                  {selectedTrip.startDate ? new Date(selectedTrip.startDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">End Date</label>
                <p className="text-foreground font-medium">
                  {selectedTrip.endDate ? new Date(selectedTrip.endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Duration</label>
                <p className="text-foreground font-medium">{selectedTrip.numberOfDays || 0} days</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Created Date</label>
                <p className="text-foreground font-medium">
                  {selectedTrip.createdAt ? new Date(selectedTrip.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            {selectedTrip.localhostName && (
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg">
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-2">
                  Assigned Local Host
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 flex items-center justify-center text-white font-bold">
                    {selectedTrip.localhostName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">{selectedTrip.localhostName}</p>
                    <p className="text-xs text-muted-foreground">ID: {selectedTrip.localhost}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Sample Itinerary</label>
              <ul className="mt-2 space-y-2 text-sm text-foreground">
                <li>✓ Day 1: Arrival & City Tour</li>
                <li>✓ Day 2-4: Cultural Exploration</li>
                <li>✓ Day 5: Local Food Experience</li>
                <li>✓ Day 6-7: Adventure Activities</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                Download PDF
              </button>
              <button className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors duration-200">
                Share
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
