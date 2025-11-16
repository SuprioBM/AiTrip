import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import DataTable from "../../components/ui/data-table";
import Modal from "../../components/ui/modal";
import { deleteDocument } from "../../utils/adminControl";


export default function UsersManagementPage({users}) {
  const [userList, setUserList] = useState(users); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const filteredUsers = userList.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterRole === "all" || user.role === filterRole)
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };


  const handleUserDeleted = (id) => {
    setUserList((prev) => prev.filter((u) => u._id !== id));
  };

  
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    {
      key: "isVerified",
      label: "Status",
      render: (isVerified) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            isVerified
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {isVerified ? "Verified" : "Unverified"}
        </span>
      ),
    },
    { key: "createdAt", label: "Join Date" },
  ];

  const actions = [
    {
      label: "View",
      className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      onClick: handleViewUser,
    },
    {
      label: "Approve",
      className: "bg-green-100 text-green-700 hover:bg-green-200",
      onClick: (user) => console.log("Approve:", user),
    },
    {
      label: "Remove",
      className: "bg-red-100 text-red-700 hover:bg-red-200",
      onClick: (user) => deleteDocument("User", user._id, handleUserDeleted),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Users Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all platform users.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-3 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="appearance-none px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer pr-8"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <ChevronDown
            className="absolute right-2 top-2.5 text-muted-foreground pointer-events-none"
            size={18}
          />
        </div>
      </div>

      {/* Users Table */}
      <DataTable columns={columns} data={filteredUsers} actions={actions} />

      {/* User Details Modal */}
      <Modal
        isOpen={modalOpen}
        title="User Details"
        onClose={() => setModalOpen(false)}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Name
              </label>
              <p className="text-foreground font-medium">{selectedUser.name}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Email
              </label>
              <p className="text-foreground font-medium">
                {selectedUser.email}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Role
              </label>
              <p className="text-foreground font-medium">{selectedUser.role}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Status
              </label>
              <p
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  selectedUser.isVerified
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {selectedUser.isVerified ? "Verified" : "Unverified"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Join Date
              </label>
              <p className="text-foreground font-medium">
                {selectedUser.createdAt}
              </p>
            </div>
            <div className="flex gap-2 pt-4 border-t border-border">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200">
                Verify
              </button>
              <button
                className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
