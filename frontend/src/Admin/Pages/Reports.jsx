import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";
import API from "../../api";

export default function ReviewsReportsPage() {
  const [reviewsReportsData, setReviewsReportsData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all reviews on mount
  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const { data } = await API.get("/reviews/getAllReviews");

        if (data.success && Array.isArray(data.reviews)) {
          setReviewsReportsData(data.reviews); // <-- use data.reviews
        } else {
          setReviewsReportsData([]);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviewsReportsData([]);
      }
    };

    fetchAllReviews();
  }, []);

  const filteredItems = (reviewsReportsData || []).filter(
    (item) =>
      item.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const columns = [
    {
      key: "user",
      label: "User",
      render: (_, row) => row.userId?.name || "Unknown",
    },
    {
      key: "location",
      label: "Location",
      render: (_, row) => row.locationName || "-",
    },
    {
      key: "comment",
      label: "Comment",
      render: (_, row) => row.comment || "-",
    },
    {
      key: "rating",
      label: "Rating",
      render: (_, row) => (row.rating ? `${row.rating} ⭐` : "-"),
    },
    {
      key: "verified",
      label: "Verified",
      render: (_, row) => (row.verified ? "Yes" : "No"),
    },
    {
      key: "date",
      label: "Date",
      render: (_, row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const actions = [
    {
      label: "View",
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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Reviews & Reports
        </h1>
        <p className="text-muted-foreground">
          Manage user reviews and report suspicious activities.
        </p>
      </div>

      {/* Search */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-3 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by user, location, or comment..."
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
        title="Review Details"
        onClose={() => setModalOpen(false)}
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                User
              </label>
              <p className="text-foreground font-medium mt-1">
                {selectedItem.userId?.name}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Location
              </label>
              <p className="text-foreground font-medium mt-1">
                {selectedItem.locationName}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Comment
              </label>
              <p className="text-foreground font-medium mt-1">
                {selectedItem.comment}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Rating
              </label>
              <p className="text-foreground font-medium mt-1">
                {selectedItem.rating} ⭐
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Verified
              </label>
              <p className="text-foreground font-medium mt-1">
                {selectedItem.verified ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Date
              </label>
              <p className="text-foreground font-medium mt-1">
                {new Date(selectedItem.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Approve
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
