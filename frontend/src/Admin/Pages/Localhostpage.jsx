import React, { useState } from "react";
import { Search, Star, ChevronDown } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";

// Mock hosts data
const hostsData = [
  { id: 1, name: "Marco Rossi", location: "Rome, Italy", rating: 4.8, availability: "Available", photo: "🇮🇹" },
  { id: 2, name: "Yuki Tanaka", location: "Tokyo, Japan", rating: 4.9, availability: "Busy", photo: "🇯🇵" },
  { id: 3, name: "Sophie Dubois", location: "Paris, France", rating: 4.7, availability: "Available", photo: "🇫🇷" },
  { id: 4, name: "Carlos Mendez", location: "Barcelona, Spain", rating: 4.6, availability: "Available", photo: "🇪🇸" },
  { id: 5, name: "Priya Sharma", location: "Mumbai, India", rating: 4.9, availability: "Available", photo: "🇮🇳" },
];

export default function LocalHostsPage({hosts}) {
  const [hostsData, setHostsData] = useState(hosts);
  const [selectedHost, setSelectedHost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");

  const filteredHosts = hostsData.filter(
    (host) =>
      (host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterAvailability === "all" || host.availability === filterAvailability)
  );

  const handleViewHost = (host) => {
    setSelectedHost(host);
    setModalOpen(true);
  };

  const columns = [
    {
      key: "name",
      label: "Host Name",
      render: (name, row) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{row.photo}</span>
          <span>{name}</span>
        </div>
      ),
    },
    { key: "location", label: "Location" },
    {
      key: "rating",
      label: "Rating",
      render: (rating) => (
        <div className="flex items-center gap-1">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span>{rating}</span>
        </div>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      render: (availability) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            availability === "Available"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {availability}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: handleViewHost,
    },
    {
      label: "Approve",
      className: "bg-green-100 text-green-700 hover:bg-green-200",
      onClick: (host) => console.log("Approve:", host),
    },
    {
      label: "Block",
      className: "bg-red-100 text-red-700 hover:bg-red-200",
      onClick: (host) => console.log("Block:", host),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Local Hosts</h1>
        <p className="text-muted-foreground">Manage and verify local experience hosts.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="appearance-none px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-8"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
          <ChevronDown
            className="absolute right-2 top-2.5 text-muted-foreground pointer-events-none"
            size={18}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredHosts} actions={actions} />

      {/* Modal */}
      <Modal isOpen={modalOpen} title="Host Details" onClose={() => setModalOpen(false)}>
        {selectedHost && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">{selectedHost.photo}</div>
              <p className="text-lg font-semibold text-foreground">{selectedHost.name}</p>
              <p className="text-sm text-muted-foreground">{selectedHost.location}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Rating
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className="text-foreground font-medium">
                  {selectedHost.rating} / 5.0
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Availability
              </label>
              <p className="text-foreground font-medium mt-1">
                {selectedHost.availability}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Bio
              </label>
              <p className="text-foreground text-sm mt-1">
                Experienced local guide with 5+ years of expertise in curating
                authentic travel experiences.
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
                Approve
              </button>
              <button className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200">
                Block
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
