import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userAPI } from "../utils/adminAPI";
import { exportUsers } from "../utils/exportUtils";
import Pagination from "../components/Pagination";

const AdminUsers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) return;
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      console.log('📡 AdminUsers: Fetching users...');
      const response = await userAPI.getAllUsers();
      console.log('✅ AdminUsers: Response received:', response);

      if (response.success) {
        // Backend returns paginated data - extract the array
        let usersData = [];

        // Try multiple possible response structures
        if (Array.isArray(response.data?.data)) {
          usersData = response.data.data;
        } else if (Array.isArray(response.users)) {
          usersData = response.users;
        } else if (Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object with a data property that's an array
          if (Array.isArray(response.data.data)) {
            usersData = response.data.data;
          }
        }

        console.log('✅ AdminUsers: Users data type:', typeof usersData, Array.isArray(usersData));
        console.log('✅ AdminUsers: Users data:', usersData);

        // Ensure usersData is an array
        if (!Array.isArray(usersData)) {
          console.warn('⚠️ AdminUsers: usersData is not an array, setting to empty array');
          usersData = [];
        }

        // Map backend fields to frontend format
        const mappedUsers = usersData.map(user => ({
          ...user,
          _id: user.id || user._id,
          name: user.name || 'Unknown User',
          email: user.email || 'No email',
          role: user.role || 'user',
          phone: user.phone || 'No phone',
          createdAt: user.createdAt || user.created_at || new Date().toISOString(),
          isActive: user.isActive !== undefined ? user.isActive : (user.is_active !== undefined ? Boolean(Number(user.is_active)) : true)
        }));

        console.log('✅ AdminUsers: Mapped users count:', mappedUsers.length);
        console.log('✅ AdminUsers: Mapped users:', mappedUsers);
        setUsers(mappedUsers);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("❌ AdminUsers: Failed to fetch users:", error);
      console.error("❌ AdminUsers: Error details:", error.message);
      showToast(error.message || "Failed to load users", "error");
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };



  const updateUser = async (userId, userData) => {
    try {
      const response = await userAPI.updateUser(userId, userData);
      
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, ...userData } : user
        ));
        showToast("User updated successfully", "success");
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      showToast(error.message || "Failed to update user", "error");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await userAPI.deleteUser(userId);
      
      if (response.success) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        showToast("User deleted successfully", "success");
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      showToast(error.message || "Failed to delete user", "error");
    }
  };

  const userDetails = (user) => {
    return {
      id: user._id,
      name: user.name || 'Unknown User',
      email: user.email || 'No email',
      role: user.role || 'user',
      phone: user.phone || 'No phone',
      address: user.address || 'No address',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || 'Never',
      isActive: user.isActive !== false
    };
  };

  const userRole = {
    user: { label: 'Customer', color: 'bg-blue-100 text-blue-800' },
    admin: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
    moderator: { label: 'Moderator', color: 'bg-green-100 text-green-800' }
  };

  const handleUserUpdate = async (userId, updates) => {
    try {
      await updateUser(userId, updates);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleExportUsers = async () => {
    try {
      await exportUsers(filteredUsers);
      showToast("Users exported successfully", "success");
    } catch (error) {
      console.error("Failed to export users:", error);
      showToast("Failed to export users", "error");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
                  <p className="text-lg text-gray-600 mt-1">Manage customer accounts, roles, and permissions efficiently</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Users</div>
                <div className="text-3xl font-bold text-gray-900">{users.length}</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchUsers}
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                {users.length > 0 && (
                  <button
                    onClick={handleExportUsers}
                    className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{users.length}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Total Users</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'user').length}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Customers</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Admins */}
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Admins</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Search Users
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value="all">All Users</option>
                <option value="user">Customers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchUsers}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Modern Users Table */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No users found</h3>
            <p className="text-gray-600 text-lg">
              {searchTerm || filterRole !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "No users registered yet."
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Table Header */}
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    User Directory
                  </h3>
                  <p className="text-gray-600 mt-2">Manage and monitor user accounts</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{filteredUsers.length}</div>
                  <div className="text-sm text-gray-500">Users Found</div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-8 py-5 text-left">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">User Information</span>
                      </div>
                    </th>
                    <th className="px-8 py-5 text-left">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Contact Details</span>
                      </div>
                    </th>
                    <th className="px-8 py-5 text-left">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Role & Status</span>
                      </div>
                    </th>
                    <th className="px-8 py-5 text-left">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Join Date</span>
                      </div>
                    </th>
                    <th className="px-8 py-5 text-left">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem._id} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                      {/* User Information */}
                      <td className="px-8 py-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {userItem.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
                              {userItem.name || "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {userItem.phone || "No phone"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Details */}
                      <td className="px-8 py-6">
                        <div className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
                          {userItem.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {userItem.address || "No address provided"}
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full ${
                            userItem.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' 
                              : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              userItem.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'
                            }`}></div>
                            {userItem.role === 'admin' ? 'Administrator' : 'Customer'}
                          </span>
                          <div>
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                              Active
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userItem.createdAt ? new Date(userItem.createdAt).toLocaleTimeString() : ""}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {/* Handle edit user */}}
                            className="group/btn inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <svg className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(userItem._id)}
                            className="group/btn inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <svg className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminUsers;
