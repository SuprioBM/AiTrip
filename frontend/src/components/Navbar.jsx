import React from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";

export default function Navbar() {
  const user = getCurrentUser();
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };
  return (
    <nav className="nav">
      <Link to="/">AiTrip</Link>
      <div className="nav-links">
        <Link to="/planner">Planner</Link>
        <Link to="/hosts">Hosts</Link>
        <Link to="/partners">Partners</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
