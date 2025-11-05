import React from "react";

export default function Dashboard({ user }) {    
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name || user?.email}</p>
      <p>Role: {user?.role}</p>
      {/* Role-based rendering examples */}
      {user?.role === "admin" && (
        <div>
          <h3>Admin controls</h3>
          <p>CRUD users, locations, analytics (see backend endpoints)</p>
        </div>
      )}
    </div>
  );
}
