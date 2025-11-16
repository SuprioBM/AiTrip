import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";

// Mock trip data
const tripsData = [
  { id: "TP001", user: "Sarah Anderson", destination: "Paris, France", budget: "$2,500", generated: "2024-02-15", duration: "7 days" },
  { id: "TP002", user: "Mike Johnson", destination: "Tokyo, Japan", budget: "$3,200", generated: "2024-02-14", duration: "10 days" },
  { id: "TP003", user: "Emily Chen", destination: "Barcelona, Spain", budget: "$1,800", generated: "2024-02-13", duration: "5 days" },
  { id: "TP004", user: "Alex Rivera", destination: "Bangkok, Thailand", budget: "$1,500", generated: "2024-02-12", duration: "8 days" },
  { id: "TP005", user: "Jessica Lee", destination: "Rome, Italy", budget: "$2,200", generated: "2024-02-11", duration: "6 days" },
];

export default function TripPlansPage({trips}) {
  const [tripsData, setTripsData] = useState(trips);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrips = tripsData.filter(
    (trip) =>
      trip.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewItinerary = (trip) => {
    setSelectedTrip(trip);
    setModalOpen(true);
  };

  const columns = [
    { key: "id", label: "Trip ID" },
    { key: "user", label: "User" },
    { key: "destination", label: "Destination" },
    { key: "budget", label: "Budget" },
    { key: "duration", label: "Duration" },
    { key: "generated", label: "Generated" },
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
                <p className="text-foreground font-medium">{selectedTrip.id}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">User</label>
                <p className="text-foreground font-medium">{selectedTrip.user}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Destination</label>
                <p className="text-foreground font-medium">{selectedTrip.destination}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Budget</label>
                <p className="text-foreground font-medium">{selectedTrip.budget}</p>
              </div>
            </div>

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
