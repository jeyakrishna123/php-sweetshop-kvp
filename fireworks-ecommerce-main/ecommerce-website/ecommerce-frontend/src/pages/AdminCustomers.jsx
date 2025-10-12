import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import axios from "../axios";

const AdminCustomers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filters, setFilters] = useState({
    segment: "all",
    status: "all",
    search: ""
  });

  // Role validation
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
  }, [user]);


  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both users and orders to calculate real analytics
      const [usersResponse, ordersResponse] = await Promise.all([
        axios.get(`/api/admin/users`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        }),
        axios.get(`/api/admin/orders`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        })
      ]);
      
      // PHP API returns data in response.data.data structure
      const users = usersResponse.data?.data?.users || usersResponse.data?.users || [];
      const allOrders = ordersResponse.data?.data?.orders || ordersResponse.data?.orders || [];

      // Ensure we have arrays before filtering
      if (!Array.isArray(users)) {
        console.error('Users is not an array:', users);
        throw new Error('Invalid users data format');
      }

      // Filter out admin users, only show customers
      const customerUsers = users.filter(u => u.role === 'user');
      
      // Calculate real analytics for each customer
      const customersData = customerUsers.map(user => {
        const userOrders = allOrders.filter(order => order.user_id === user.id || order.userId === user.id || order.user === user.id);
        const totalSpent = userOrders.reduce((sum, order) => sum + (parseFloat(order.total_price) || parseFloat(order.totalPrice) || 0), 0);
        const totalOrders = userOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        // Calculate last order date safely
        let lastOrderDate;
        if (userOrders.length > 0) {
          const validDates = userOrders
            .map(o => {
              const dateStr = o.created_at || o.createdAt || o.orderDate;
              const timestamp = dateStr ? new Date(dateStr).getTime() : null;
              return !isNaN(timestamp) ? timestamp : null;
            })
            .filter(d => d !== null);

          lastOrderDate = validDates.length > 0 ? new Date(Math.max(...validDates)).toISOString() : new Date(user.created_at || user.createdAt).toISOString();
        } else {
          lastOrderDate = new Date(user.created_at || user.createdAt).toISOString();
        }

        return {
          _id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || 'Not provided',
          joinDate: user.created_at || user.createdAt || new Date().toISOString(),
          totalOrders: totalOrders,
          lastOrder: lastOrderDate,
          totalSpent: totalSpent,
          averageOrderValue: averageOrderValue,
          segment: totalSpent > 50000 ? 'vip' : totalOrders > 3 ? 'regular' : 'new',
          status: user.is_active !== false && user.is_active !== 0 ? 'active' : 'inactive',
          isVerified: user.is_email_verified || user.isVerified || false,
          lastLogin: user.last_login || user.lastLogin || user.created_at || user.createdAt,
          orders: userOrders
        };
      });
      
      setCustomers(customersData);
      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setError("Failed to load customer data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchCustomers();
    }
  }, [user]);

  const handleEditCustomer = (customer) => {
    setEditingCustomer({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      isActive: customer.status === 'active'
    });
    setShowEditModal(true);
  };

  const handleSaveCustomer = async () => {
    try {
      const response = await axios.put(`/api/admin/users/${editingCustomer._id}`, {
        name: editingCustomer.name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        isActive: editingCustomer.isActive
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      if (response.data.success) {
        showToast('Customer updated successfully', 'success');
        setShowEditModal(false);
        setEditingCustomer(null);
        fetchCustomers(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update customer:', error);
      showToast('Failed to update customer', 'error');
    }
  };

  const handleToggleStatus = async (customerId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? false : true;
      
      const response = await axios.put(`/api/admin/users/${customerId}`, {
        isActive: newStatus
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      if (response.data.success) {
        showToast(`Customer ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
        fetchCustomers(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to toggle customer status:', error);
      showToast('Failed to update customer status', 'error');
    }
  };

  const handleViewOrders = (customer) => {
    showToast(`Viewing ${customer.totalOrders} orders for ${customer.name}`, 'info');
    // You could navigate to orders page with customer filter
  };

  const handleSendEmail = (customer) => {
    // Open email client or show email modal
    const subject = encodeURIComponent('Important Update from Your Store');
    const body = encodeURIComponent(`Dear ${customer.name},\n\nWe hope you're doing well!\n\nBest regards,\nYour Store Team`);
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`);
  };

  const getSegmentBadge = (segment) => {
    switch (segment) {
      case 'vip':
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">VIP</span>;
      case 'regular':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Regular</span>;
      case 'new':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">New</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactive</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unknown</span>;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (filters.segment !== "all" && customer.segment !== filters.segment) return false;
    if (filters.status !== "all" && customer.status !== filters.status) return false;
    if (filters.search && !customer.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !customer.email.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getStats = () => {
    const totalCustomers = customers.length;
    const vipCustomers = customers.filter(c => c.segment === 'vip').length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    
    return { totalCustomers, vipCustomers, activeCustomers, totalRevenue };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
            <p className="text-gray-600">Advanced customer segmentation and analytics</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">👥</span>
                Customer Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your customers and analyze their behavior</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchCustomers}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button
                onClick={() => {
                  if (customers.length === 0) {
                    showToast('No customer data to export', 'warning');
                    return;
                  }
                  const csvData = customers.map(c => ({
                    Name: c.name,
                    Email: c.email,
                    Phone: c.phone,
                    'Total Orders': c.totalOrders,
                    'Total Spent': `₹${c.totalSpent}`,
                    Segment: c.segment,
                    Status: c.status,
                    'Join Date': new Date(c.joinDate).toLocaleDateString()
                  }));
                  const csv = [
                    Object.keys(csvData[0]).join(','),
                    ...csvData.map(row => Object.values(row).join(','))
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'customers.csv';
                  a.click();
                  showToast('Customer data exported successfully', 'success');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Customers</p>
              <p className="text-3xl font-bold">{stats.totalCustomers}</p>
              <p className="text-blue-200 text-sm mt-1">Registered users</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">VIP Customers</p>
              <p className="text-3xl font-bold">{stats.vipCustomers}</p>
              <p className="text-purple-200 text-sm mt-1">High-value customers</p>
            </div>
            <div className="text-4xl opacity-80">⭐</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Customers</p>
              <p className="text-3xl font-bold">{stats.activeCustomers}</p>
              <p className="text-green-200 text-sm mt-1">Currently active</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-pink-200 text-sm mt-1">From all customers</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Search Customers</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📊 Segment</label>
            <select
              value={filters.segment}
              onChange={(e) => setFilters({ ...filters, segment: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Segments</option>
              <option value="vip">⭐ VIP (₹50K+ spent)</option>
              <option value="regular">👤 Regular (3+ orders)</option>
              <option value="new">🆕 New customers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🔄 Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">🚫 Inactive</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ segment: "all", status: "all", search: "" })}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <span>🗑️</span>
            <span>Clear</span>
          </button>
        </div>
        
        {filteredCustomers.length !== customers.length && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        )}
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">📋 Customer Database</h3>
            <div className="text-sm text-gray-500">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
          
          {filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              Joined {new Date(customer.joinDate).toLocaleDateString()}
                              {customer.isVerified && <span className="ml-2 text-green-600">✓ Verified</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                        {customer.lastLogin && (
                          <div className="text-xs text-gray-400">
                            Last login: {new Date(customer.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.totalOrders} orders</div>
                        {customer.totalOrders > 0 ? (
                          <div className="text-sm text-gray-500">Last: {new Date(customer.lastOrder).toLocaleDateString()}</div>
                        ) : (
                          <div className="text-sm text-orange-500">No orders yet</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₹{customer.totalSpent.toLocaleString()}</div>
                        {customer.totalOrders > 0 && (
                          <div className="text-sm text-gray-500">Avg: ₹{Math.round(customer.averageOrderValue).toLocaleString()}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSegmentBadge(customer.segment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                            title="Edit Customer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleViewOrders(customer)}
                            className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 transition-colors"
                            title="View Orders"
                          >
                            📦 Orders
                          </button>
                          <button
                            onClick={() => handleSendEmail(customer)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                            title="Send Email"
                          >
                            ✉️ Email
                          </button>
                          <button
                            onClick={() => handleToggleStatus(customer._id, customer.status)}
                            className={`px-3 py-1 rounded text-xs transition-colors ${
                              customer.status === 'active' 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                            title={customer.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {customer.status === 'active' ? '🚫 Deactivate' : '✅ Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 mb-4">
                {customers.length === 0 
                  ? "No customers have registered yet. Start promoting your store!" 
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {customers.length === 0 && (
                <button
                  onClick={fetchCustomers}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh Data
                </button>
              )}
            </div>
          )}
        </div>

        {/* Edit Customer Modal */}
        {showEditModal && editingCustomer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Edit Customer</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCustomer(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingCustomer.email}
                      onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editingCustomer.phone}
                      onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingCustomer.isActive}
                      onChange={(e) => setEditingCustomer({...editingCustomer, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Active Customer
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCustomer(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomer}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Customer</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({...editingCustomer, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({...editingCustomer, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingCustomer.isActive}
                    onChange={(e) => setEditingCustomer({...editingCustomer, isActive: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active Customer
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomer}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminCustomers;
