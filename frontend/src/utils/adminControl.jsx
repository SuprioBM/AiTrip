// utils/adminActions.js
import api from "../api.js";
import { toast } from "sonner";

export const deleteDocument = async (collection, id, onSuccess) => {
  // Show a confirmation toast
  toast.custom((t) => (
    <div className="flex flex-col gap-2 p-4 bg-white border rounded shadow">
      <p>Are you sure you want to delete this {collection}?</p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={async () => {
            try {
              await api.delete(`/admin/${collection}/${id}`);
              toast.dismiss(t.id); // close the toast
              toast.success("Deleted successfully");
              if (onSuccess) onSuccess(id);
            } catch (err) {
              console.error(err);
              toast.dismiss(t.id);
              toast.error(err.response?.data?.message || "Error deleting item");
            }
          }}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          No
        </button>
      </div>
    </div>
  ));
};

export const createDocument = async (collection, data, onSuccess) => {
  try {
    const response = await api.post(`/admin/${collection}`, data);
    toast.success(`${collection} created successfully`);
    if (onSuccess) onSuccess(response.data); // update context immediately
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || `Error creating ${collection}`);
  }
};


export const updateDocument = async (collection, id, data, onSuccess) => {
  try {
    const response = await api.put(`/admin/${collection}/${id}`, data);
    toast.success(`${collection} updated successfully`);
    if (onSuccess) onSuccess(response.data); // update context immediately
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || `Error updating ${collection}`);
  }
};
