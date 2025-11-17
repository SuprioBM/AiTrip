import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api.js";
import {
  deleteDocument,
  createDocument,
  updateDocument,
} from "../utils/adminControl.jsx";
import { toast } from "sonner";

const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const [stats, setStats] = useState({
    users: [],
    trips: [],
    hosts: [],
    bookings: [],
    partners: [],
    reviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const collectionMap = {
    user: "users",
    users: "users",
    trip: "trips",
    trips: "trips",
    host: "hosts",
    hosts: "hosts",
    booking: "bookings",
    bookings: "bookings",
    partner: "partners",
    partners: "partners",
    review: "reviews",
    reviews: "reviews",
  };

  // ======= Fetch stats =======
  const fetchStats = async (initial = false) => {
    try {
      if (initial) setLoading(true); // only show loading on first fetch
      const response = await api.get("/admin/stats/all");
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      if (initial) setLoading(false);
    }
  };

 useEffect(() => {
   fetchStats(true); // initial fetch shows loading

   const interval = setInterval(() => fetchStats(false), 5000); // polling without loading
   return () => clearInterval(interval);
 }, []);

  // ======== CRUD / Update helpers ========
  const removeItem = async (collection, id) => {
    const key = collectionMap[collection.toLowerCase()];
    if (!key) return console.error("Invalid collection:", collection);

    try {
      await deleteDocument(collection, id, () => {
        setStats((prev) => ({
          ...prev,
          [key]: prev[key].filter((item) => item._id !== id),
        }));
      });
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

   const addItem = async (collection, newItem) => {
     const key = collectionMap[collection.toLowerCase()];
     if (!key) return console.error("Invalid collection:", collection);

     try {
       const created = await createDocument(collection, newItem);
       setStats((prev) => ({
         ...prev,
         [key]: [created, ...prev[key]],
       }));
     } catch (err) {
       console.error("Failed to create item:", err);
     }
   };

   const updateItem = async (collection, id, updatedData) => {
     const key = collectionMap[collection.toLowerCase()];
     if (!key) return console.error("Invalid collection:", collection);

     try {
       const updated = await updateDocument(collection, id, updatedData);
       setStats((prev) => ({
         ...prev,
         [key]: prev[key].map((item) => (item._id === id ? updated : item)),
       }));
     } catch (err) {
       console.error("Failed to update item:", err);
     }
   };

  return (
    <AdminContext.Provider
      value={{
        stats,
        loading,
        error,
        removeItem,
        updateItem,
        addItem,
        fetchStats, // expose fetch in case you want manual refresh
        setStats,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};
