// utils/adminActions.js
import api from "../api.js";

export const deleteDocument = async (collection, id, onSuccess) => {
  if (!window.confirm("Are you sure you want to delete this?")) return;

  try {
    await api.delete(`/admin/${collection}/${id}`);
    alert("Deleted successfully");
    if (onSuccess) onSuccess(id); // callback to update state
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Error deleting item");
  }
};
