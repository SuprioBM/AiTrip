import React from "react";
import { toast } from "sonner";

export function confirmToast(message) {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 text-sm text-slate-800">
          <div className="mb-3">{message}</div>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      { duration: 0 }
    );
  });
}

export default confirmToast;
