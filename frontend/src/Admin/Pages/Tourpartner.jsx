import React, { useState } from "react";
import { Search, ChevronDown, CheckCircle } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";
import { useAdmin } from "../../context/AdminContext";

const partnersData = [
  { id: 1, name: "Global Adventures Co", rating: 4.7, status: "Verified", joinDate: "2023-06-15", tours: 24 },
  { id: 2, name: "Local Experiences Ltd", rating: 4.5, status: "Unverified", joinDate: "2024-01-20", tours: 8 },
  { id: 3, name: "Premier Tours Inc", rating: 4.9, status: "Verified", joinDate: "2023-03-10", tours: 42 },
  { id: 4, name: "Cultural Journey Tours", rating: 4.6, status: "Verified", joinDate: "2023-09-05", tours: 18 },
  { id: 5, name: "Adventure Seekers", rating: 3.8, status: "Unverified", joinDate: "2024-02-01", tours: 5 },
];

export default function TourPartnersPage() {
  const { stats } = useAdmin();
  const partnersData = stats?.partners || [];
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPartners = partnersData.filter(
    (partner) =>
      (partner.placeName || partner.name || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === "all" || partner.status === filterStatus)
  );

  const handleViewPartner = (partner) => {
    setSelectedPartner(partner);
    setModalOpen(true);
  };

  const columns = [
    { 
      key: "placeName", 
      label: "Destination",
      render: (value, partner) => value || partner.name || "N/A"
    },
    { 
      key: "createdBy", 
      label: "Created By",
      render: (value) => value?.name || value?.email || "N/A"
    },
    { 
      key: "members", 
      label: "Accepted Partners",
      render: (members) => {
        if (!members || members.length === 0) return "No partners yet";
        return members.map(m => m.name || m.email).join(", ");
      }
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <div className="flex items-center gap-2">
          <CheckCircle
            size={16}
            className={status === "open" ? "text-green-600" : status === "full" ? "text-blue-600" : "text-gray-400"}
          />
          <span
            className={`text-xs font-medium ${
              status === "open" ? "text-green-700" : status === "full" ? "text-blue-700" : "text-gray-600"
            }`}
          >
            {status || "open"}
          </span>
        </div>
      ),
    },
    { 
      key: "createdAt", 
      label: "Created Date",
      render: (value) => value ? new Date(value).toLocaleDateString() : "N/A"
    },
  ];

  const actions = [
    {
      label: "View",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: handleViewPartner,
    },
    {
      label: "Approve",
      className: "bg-green-100 text-green-700 hover:bg-green-200",
      onClick: (partner) => console.log("Approve:", partner),
    },
    {
      label: "Reject",
      className: "bg-red-100 text-red-700 hover:bg-red-200",
      onClick: (partner) => console.log("Reject:", partner),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Tour Partners</h1>
        <p className="text-muted-foreground">Manage and verify tour partner companies.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by partner name..."
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
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
          <ChevronDown className="absolute right-2 top-2.5 text-muted-foreground pointer-events-none" size={18} />
        </div>
      </div>

      {/* Partners Table */}
      <DataTable columns={columns} data={filteredPartners} actions={actions} />

      {/* Modal */}
      <Modal isOpen={modalOpen} title="Partner-Up Details" onClose={() => setModalOpen(false)}>
        {selectedPartner && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Destination
              </label>
              <p className="text-foreground font-medium mt-1">{selectedPartner.placeName || "N/A"}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Created By
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
                <p className="text-foreground font-medium">
                  {selectedPartner.createdBy?.name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedPartner.createdBy?.email || ""}
                </p>
                {selectedPartner.createdBy?.phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {selectedPartner.createdBy.phone}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Accepted Partners ({selectedPartner.members?.length || 0} / {selectedPartner.maxMembers || 0})
              </label>
              {selectedPartner.members && selectedPartner.members.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {selectedPartner.members.map((member, idx) => (
                    <div key={idx} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-foreground font-medium">
                        {member.name || "N/A"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email || ""}
                      </p>
                      {member.phone && (
                        <p className="text-sm text-muted-foreground">
                          Phone: {member.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-2 text-sm">No partners have accepted yet</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </label>
                <p className="text-foreground font-medium mt-1 capitalize">{selectedPartner.status || "open"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Created Date
                </label>
                <p className="text-foreground font-medium mt-1">
                  {selectedPartner.createdAt ? new Date(selectedPartner.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Number of Days
                </label>
                <p className="text-foreground font-medium mt-1">{selectedPartner.numberOfDays || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Budget Range
                </label>
                <p className="text-foreground font-medium mt-1">
                  {selectedPartner.budgetRange ? `$${selectedPartner.budgetRange.min} - $${selectedPartner.budgetRange.max}` : "N/A"}
                </p>
              </div>
            </div>

            {(selectedPartner.startDate || selectedPartner.endDate) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedPartner.startDate && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Start Date
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {new Date(selectedPartner.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedPartner.endDate && (
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      End Date
                    </label>
                    <p className="text-foreground font-medium mt-1">
                      {new Date(selectedPartner.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200">
                Approve
              </button>
              <button className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200">
                Reject
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
