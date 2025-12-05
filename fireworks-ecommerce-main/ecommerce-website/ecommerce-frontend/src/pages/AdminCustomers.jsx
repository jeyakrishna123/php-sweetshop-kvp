import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userAPI } from "../utils/adminAPI";
import Pagination from "../components/Pagination";

const AdminCustomers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSegment, setFilterSegment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) return;
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    try {
    setLoading(true);
      console.log('📡 AdminCustomers: Fetching customers from /api/users/all');
      
      // Use the correct API endpoint
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/users/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('✅ AdminCustomers: API response:', data);
      
      if (data.success) {
        let usersData = [];
        
        // Handle different response structures
        if (Array.isArray(data.data?.data)) {
          usersData = data.data.data;
        } else if (Array.isArray(data.data)) {
          usersData = data.data;
        } else if (Array.isArray(data.users)) {
          usersData = data.users;
        }

        console.log('✅ AdminCustomers: Users data:', usersData);

        // Filter only customers (role = 'user')
        const customerData = usersData
          .filter(user => user.role === 'user')
          .map(customer => ({
            ...customer,
            _id: customer.id || customer._id,
            name: customer.name || 'Unknown Customer',
            email: customer.email || 'No email',
            phone: customer.phone || 'Not provided',
            createdAt: customer.createdAt || customer.created_at || new Date().toISOString(),
            isActive: customer.isActive !== undefined ? customer.isActive : (customer.is_active !== undefined ? Boolean(Number(customer.is_active)) : true),
            isEmailVerified: customer.isEmailVerified !== undefined ? customer.isEmailVerified : (customer.is_email_verified !== undefined ? Boolean(Number(customer.is_email_verified)) : false),
            // Mock data for orders and revenue
            orders: Math.floor(Math.random() * 5),
            revenue: Math.floor(Math.random() * 1000) + 100,
            lastOrder: customer.orders > 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
            segment: 'New' // All customers are new for now
          }));

        console.log('✅ AdminCustomers: Mapped customers:', customerData);
        setCustomers(customerData);
        } else {
        throw new Error(data.message || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("❌ AdminCustomers: Failed to fetch customers:", error);
      showToast(error.message || "Failed to load customers", "error");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (customerId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/users/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          is_active: isActive ? 1 : 0,
          isActive: isActive 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCustomers(prev => prev.map(customer => 
          customer._id === customerId 
            ? { ...customer, isActive }
            : customer
        ));
        showToast(`Customer ${isActive ? 'activated' : 'deactivated'} successfully`, "success");
      } else {
        throw new Error(data.message || "Failed to update customer");
      }
    } catch (error) {
      console.error("❌ Failed to update customer status:", error);
      showToast(error.message || "Failed to update customer status", "error");
    }
  };

  const handleEditCustomer = (customer) => {
    const newName = prompt('Enter new name:', customer.name);
    if (newName && newName.trim() !== '' && newName !== customer.name) {
      if (newName.length < 2) {
        showToast('Name must be at least 2 characters long', "error");
        return;
      }
      updateCustomerInfo(customer._id, { name: newName.trim() });
    } else if (newName && newName.trim() === '') {
      showToast('Name cannot be empty', "error");
    }
  };

  const handleViewOrders = (customer) => {
    showToast(`Viewing orders for ${customer.name}`, "info");
    // TODO: Implement navigation to customer orders page
    console.log('View orders for customer:', customer);
  };

  const handleEmailCustomer = (customer) => {
    const subject = prompt('Email subject:', 'Message from SK Bakers');
    if (subject && subject.trim() !== '') {
      const message = prompt('Email message:', 'Hello ' + customer.name + ',\n\nThank you for being our valued customer!');
      if (message && message.trim() !== '') {
        if (subject.length < 3) {
          showToast('Subject must be at least 3 characters long', "error");
          return;
        }
        if (message.length < 10) {
          showToast('Message must be at least 10 characters long', "error");
          return;
        }
        sendEmailToCustomer(customer._id, subject.trim(), message.trim());
      } else if (message && message.trim() === '') {
        showToast('Message cannot be empty', "error");
      }
    } else if (subject && subject.trim() === '') {
      showToast('Subject cannot be empty', "error");
    }
  };

  const updateCustomerInfo = async (customerId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/users/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCustomers(prev => prev.map(customer => 
          customer._id === customerId 
            ? { ...customer, ...updateData }
            : customer
        ));
        showToast('Customer updated successfully', "success");
      } else {
        throw new Error(data.message || "Failed to update customer");
      }
    } catch (error) {
      console.error("❌ Failed to update customer:", error);
      showToast(error.message || "Failed to update customer", "error");
    }
  };

  const sendEmailToCustomer = async (customerId, subject, message) => {
    try {
      showToast('Sending email...', "info");
      
      const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NODE_ENV === 'production' ? 'https://skbakers.com/api' : 'http://localhost:8000/api'}/users/email/${customerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.message && data.message.includes('development mode')) {
          showToast('Email queued for delivery (development mode)', "success");
        } else {
          showToast('Email sent successfully!', "success");
        }
      } else {
        throw new Error(data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("❌ Failed to send email:", error);
      
      // Handle different types of errors
      if (error.message.includes('Method not allowed')) {
        showToast('Email service temporarily unavailable', "error");
      } else if (error.message.includes('User not found')) {
        showToast('Customer not found', "error");
      } else if (error.message.includes('Invalid email')) {
        showToast('Customer email address is invalid', "error");
      } else if (error.message.includes('Validation failed')) {
        showToast('Please check your email content', "error");
      } else if (error.message.includes('Email service error')) {
        showToast('Email service error. Please try again later.', "error");
      } else {
        showToast('Failed to send email. Please try again.', "error");
      }
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = filterSegment === "all" || customer.segment.toLowerCase() === filterSegment.toLowerCase();
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && customer.isActive) ||
                         (filterStatus === "inactive" && !customer.isActive);
    
    return matchesSearch && matchesSegment && matchesStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Customers</h1>

      {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 w-full">
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Search Bar */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
            <input
              type="text"
              placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
              </div>

              {/* Filters */}
              <div className="flex gap-4 flex-shrink-0">
                {/* Segment Filter */}
            <select
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
            >
              <option value="all">All Segments</option>
                  <option value="new">New</option>
                  <option value="returning">Returning</option>
                  <option value="vip">VIP</option>
            </select>

                {/* Status Filter */}
            <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0"
            >
              <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
            </select>

                {/* Clear Button */}
          <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterSegment("all");
                    setFilterStatus("all");
                  }}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 flex items-center gap-2 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
          </button>
        </div>
            </div>
          </div>
        </div>
          
        {/* Customer Database */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center w-full">
            <h2 className="text-xl font-bold text-gray-900">Customer Database</h2>
            <span className="text-sm text-gray-500">{filteredCustomers.length} customers</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading customers...</span>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200 w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CONTACT</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORDERS</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REVENUE</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEGMENT</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50 transition-colors duration-200">
                      {/* Customer Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {customer.name?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                            <div className="text-xs text-gray-500">Joined {formatDate(customer.createdAt)}</div>
                            {customer.isEmailVerified && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full mt-1">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                        <div className="text-xs text-gray-400">Last login: {formatLastLogin(customer.createdAt)}</div>
                      </td>

                      {/* Orders */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.orders} orders
                        </div>
                        {customer.orders > 0 ? (
                          <div className="text-xs text-gray-500">
                            Last: {formatDate(customer.lastOrder)}<br />
                            Avg: ₹{Math.floor(customer.revenue / customer.orders)}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">No orders yet</div>
                        )}
                      </td>

                      {/* Revenue */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">₹{customer.revenue.toFixed(2)}</div>
                      </td>

                      {/* Segment */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {customer.segment}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleViewOrders(customer)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors duration-200 cursor-pointer"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                            Orders
                          </button>
                          <button
                            onClick={() => handleEmailCustomer(customer)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200 cursor-pointer"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </button>
                          <button
                            onClick={() => updateCustomerStatus(customer._id, !customer.isActive)}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-200 cursor-pointer ${
                              customer.isActive
                                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                            }`}
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {customer.isActive ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              )}
                            </svg>
                            {customer.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
            </div>
          </div>
        </div>
  );
};

export default AdminCustomers;
