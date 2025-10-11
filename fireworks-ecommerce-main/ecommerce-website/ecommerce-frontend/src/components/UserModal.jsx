import { useState, useEffect } from "react";

export default function UserModal({ open, onClose, onSave, initialUser }) {
  const [role, setRole] = useState("");

  useEffect(() => {
    setRole(initialUser?.role || "");
  }, [initialUser, open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ role });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Edit User Role</h2>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        >
          <option value="">Select role</option>
          <option value="user">User</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition duration-200">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition duration-200">Update</button>
        </div>
      </form>
    </div>
  );
}
