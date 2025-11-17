import React, { useState } from "react";
import { Search, AlertCircle, CheckCircle } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";
import { useAdmin } from "../../context/AdminContext";

// Mock reviews and reports data
const reviewsReportsData = [
  { id: 1, type: "Review", user: "Sarah Anderson", subject: "Excellent host experience", rating: 5, status: "Approved", date: "2024-02-15" },
  { id: 2, type: "Report", user: "Mike Johnson", subject: "Suspicious booking activity", severity: "High", status: "Under Review", date: "2024-02-14" },
  { id: 3, type: "Review", user: "Emily Chen", subject: "Great local experience", rating: 4, status: "Approved", date: "2024-02-13" },
  { id: 4, type: "Report", user: "Alex Rivera", subject: "Inappropriate host behavior", severity: "Medium", status: "Resolved", date: "2024-02-12" },
  { id: 5, type: "Review", user: "Jessica Lee", subject: "Amazing trip planning service", rating: 5, status: "Approved", date: "2024-02-11" },
];

export default function ReviewsReportsPage() {
  const { stats } = useAdmin();
  const reviewsReportsData = stats?.reviewsReports || [];
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = reviewsReportsData.filter(
    (item) =>
      item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (type) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            type === "Review" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
          }`}
        >
          {type}
        </span>
      ),
    },
    { key: "user", label: "User" },
    { key: "subject", label: "Subject" },
    {
      key: "rating",
      label: "Rating",
      render: (rating, row) => (row.type === "Review" ? `${rating} ⭐` : "-"),
    },
    {
      key: "severity",
      label: "Severity",
      render: (severity, row) => {
        if (!severity) return "-";
        const severityColors = {
          High: "text-red-700",
          Medium: "text-yellow-700",
          Low: "text-green-700",
        };
        return <span className={severityColors[severity]}>{severity}</span>;
      },
    },
    {
      key: "status",
      label: "Status",
      render: (status) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            status === "Approved"
              ? "bg-green-100 text-green-700"
              : status === "Resolved"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      ),
    },
    { key: "date", label: "Date" },
  ];

  const actions = [
    {
      label: "Review",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: handleViewDetails,
    },
    {
      label: "Warn",
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      onClick: (item) => console.log("Warn:", item),
    },
    {
      label: "Ban",
      className: "bg-red-100 text-red-700 hover:bg-red-200",
      onClick: (item) => console.log("Ban:", item),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reviews & Reports</h1>
        <p className="text-muted-foreground">Manage user reviews and report suspicious activities.</p>
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search by user or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Reviews Table */}
      <DataTable columns={columns} data={filteredItems} actions={actions} />

      {/* Details Modal */}
      <Modal
        isOpen={modalOpen}
        title={selectedItem?.type === "Review" ? "Review Details" : "Report Details"}
        onClose={() => setModalOpen(false)}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
              <p className="text-foreground font-medium mt-1">{selectedItem.type}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">User</label>
              <p className="text-foreground font-medium mt-1">{selectedItem.user}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Subject</label>
              <p className="text-foreground font-medium mt-1">{selectedItem.subject}</p>
            </div>

            {selectedItem.type === "Review" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Rating</label>
                <p className="text-foreground font-medium mt-1">{selectedItem.rating} ⭐</p>
              </div>
            )}

            {selectedItem.type === "Report" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Severity</label>
                <p className="text-foreground font-medium mt-1">{selectedItem.severity}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Status</label>
              <p className="text-foreground font-medium mt-1">{selectedItem.status}</p>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                {selectedItem.type === "Review" ? "Approve" : "Resolve"}
              </button>
              <button className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                Remove
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
