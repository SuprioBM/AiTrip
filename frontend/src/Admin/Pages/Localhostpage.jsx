import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, X } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function LocalHostsPage() {
  const [localhosts, setLocalhosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHost, setSelectedHost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    locationCode: "",
    locationName: "",
  });

  const fetchLocalhosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/hosts/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setLocalhosts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching localhosts:", error);
      alert("Failed to fetch localhosts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalhosts();
  }, []);

  const filteredHosts = localhosts.filter(
    (host) =>
      host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/hosts/admin/create`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Localhost created successfully!");
        setCreateModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          locationCode: "",
          locationName: "",
        });
        fetchLocalhosts();
      }
    } catch (error) {
      console.error("Error creating localhost:", error);
      alert(error.response?.data?.message || "Failed to create localhost");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/hosts/admin/${selectedHost._id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Localhost updated successfully!");
        setEditModalOpen(false);
        setSelectedHost(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          locationCode: "",
          locationName: "",
        });
        fetchLocalhosts();
      }
    } catch (error) {
      console.error("Error updating localhost:", error);
      alert(error.response?.data?.message || "Failed to update localhost");
    }
  };

  const handleDelete = async (host) => {
    if (!confirm(`Are you sure you want to delete ${host.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/hosts/admin/${host._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Localhost deleted successfully!");
        fetchLocalhosts();
      }
    } catch (error) {
      console.error("Error deleting localhost:", error);
      alert(error.response?.data?.message || "Failed to delete localhost");
    }
  };

  const handleEdit = (host) => {
    setSelectedHost(host);
    setFormData({
      name: host.name,
      email: host.email || "",
      phone: host.phone || "",
      locationCode: host.locationCode,
      locationName: host.locationName,
    });
    setEditModalOpen(true);
  };

  const handleViewHost = (host) => {
    setSelectedHost(host);
    setModalOpen(true);
  };

  const columns = [
    {
      key: "_id",
      label: "ID",
      render: (id) => (
        <span className="font-mono font-semibold text-blue-600">{id}</span>
      ),
    },
    { key: "name", label: "Host Name" },
    { key: "locationName", label: "Location" },
    {
      key: "locationCode",
      label: "Code",
      render: (code) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
          {code.toUpperCase()}
        </span>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  const actions = [
    {
      label: "View",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: handleViewHost,
    },
    {
      label: "Edit",
      className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      onClick: handleEdit,
    },
    {
      label: "Delete",
      className: "bg-red-100 text-red-700 hover:bg-red-200",
      onClick: handleDelete,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Local Hosts Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and assign local hosts to locations.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus size={20} />
          Create Localhost
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-3 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, location, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <DataTable columns={columns} data={filteredHosts} actions={actions} />
      )}

      {/* VIEW MODAL */}
      <Modal
        isOpen={modalOpen}
        title="Localhost Details"
        onClose={() => setModalOpen(false)}
      >
        {selectedHost && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  ID
                </label>
                <p className="text-foreground font-mono font-semibold text-blue-600 mt-1">
                  {selectedHost._id}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Name
                </label>
                <p className="text-foreground font-medium mt-1">
                  {selectedHost.name}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Location
                </label>
                <p className="text-foreground mt-1">{selectedHost.locationName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Location Code
                </label>
                <p className="text-foreground font-mono mt-1">
                  {selectedHost.locationCode.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Email
                </label>
                <p className="text-foreground mt-1">
                  {selectedHost.email || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Phone
                </label>
                <p className="text-foreground mt-1">
                  {selectedHost.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE MODAL */}
      <Modal
        isOpen={createModalOpen}
        title="Create New Localhost"
        onClose={() => setCreateModalOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Host Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter host name"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Location Name *
            </label>
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., Dhaka, London, Paris"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Location Code *
            </label>
            <input
              type="text"
              name="locationCode"
              value={formData.locationCode}
              onChange={handleFormChange}
              required
              maxLength={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="First 3 letters (e.g., dha, lon, par)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              First 3 letters of location. ID will be auto-generated (e.g., dha101)
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="host@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="+1234567890"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Localhost
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        title="Edit Localhost"
        onClose={() => setEditModalOpen(false)}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              ID (Cannot be changed)
            </label>
            <input
              type="text"
              value={selectedHost?._id || ""}
              disabled
              className="w-full px-4 py-2 border border-border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Host Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Location Name *
            </label>
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Location Code (Cannot be changed)
            </label>
            <input
              type="text"
              value={formData.locationCode}
              disabled
              className="w-full px-4 py-2 border border-border rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Localhost
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
