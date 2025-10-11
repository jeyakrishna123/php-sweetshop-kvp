import { useState, useEffect } from "react";

export default function OrderModal({ open, onClose, onSave, initialOrder }) {
  const [status, setStatus] = useState("");

  useEffect(() => {
    setStatus(initialOrder?.status || "");
  }, [initialOrder, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ status });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Edit Order Status</h2>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        >
          <option value="">Select status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-200">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition duration-200">Update</button>
        </div>
      </form>
    </div>
  );
}
