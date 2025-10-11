import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../axios';

const AdminContacts = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    unread: 0,
    responded: 0,
    closed: 0
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/contacts');
      if (response.data.success) {
        setContacts(response.data.contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      showToast('Failed to fetch contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/contacts/stats/overview');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
    
    // Mark as read if not already read
    if (!contact.isRead) {
      markAsRead(contact.id);
    }
  };

  const markAsRead = async (contactId) => {
    try {
      const response = await axios.put(`/api/contacts/${contactId}/read`);
      if (response.data.success) {
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? { ...contact, isRead: true } : contact
        ));
        fetchStats();
      }
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  const handleUpdateStatus = async (contactId, status, adminNotes = '') => {
    try {
      const response = await axios.put(`/api/contacts/${contactId}`, {
        status,
        adminNotes
      });
      if (response.data.success) {
        setContacts(prev => prev.map(contact => 
          contact.id === contactId ? { ...contact, status, adminNotes } : contact
        ));
        showToast('Contact status updated successfully', 'success');
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      showToast('Failed to update contact status', 'error');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact submission?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/contacts/${contactId}`);
      if (response.data.success) {
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
        showToast('Contact deleted successfully', 'success');
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast('Failed to delete contact', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'responded': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !contact.isRead;
    if (filter === 'new') return contact.status === 'new';
    if (filter === 'responded') return contact.status === 'responded';
    if (filter === 'closed') return contact.status === 'closed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Contact Management</h1>
                  <p className="text-lg text-gray-600 mt-1">Manage customer contact form submissions efficiently</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          {/* Total Contacts */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Total Contacts</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* New Contacts */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">New</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Responded */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">{stats.responded}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Responded</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Unread */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{stats.unread}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Unread</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Read */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-600">{stats.read}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Read</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Closed */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-500">{stats.closed}</div>
                <div className="text-sm font-medium text-gray-600 mt-1">Closed</div>
              </div>
              <div className="p-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Filter Contacts</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredContacts.length} of {contacts.length} contacts
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: contacts.length, color: 'gray' },
              { key: 'unread', label: 'Unread', count: stats.unread, color: 'red' },
              { key: 'new', label: 'New', count: stats.new, color: 'blue' },
              { key: 'responded', label: 'Responded', count: stats.responded, color: 'green' },
              { key: 'closed', label: 'Closed', count: stats.closed, color: 'gray' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  filter === tab.key
                    ? `bg-${tab.color}-100 text-${tab.color}-800 border-2 border-${tab.color}-200 shadow-md`
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  filter === tab.key
                    ? `bg-${tab.color}-200 text-${tab.color}-800`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Modern Contacts Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Table Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Contact Submissions
                </h3>
                <p className="text-gray-600 mt-2">Manage and respond to customer inquiries efficiently</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{filteredContacts.length}</div>
                <div className="text-sm text-gray-500">Total Contacts</div>
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
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Contact Information</span>
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Message Details</span>
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Status</span>
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Date & Time</span>
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
                {filteredContacts.map((contact, index) => (
                  <tr key={contact.id} className={`group hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ${!contact.isRead ? 'bg-gradient-to-r from-blue-50/30 to-indigo-50/30 border-l-4 border-l-blue-500' : ''}`}>
                    {/* Contact Information */}
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {contact.fullName.charAt(0).toUpperCase()}
                          </div>
                          {!contact.isRead && (
                            <div className="relative -mt-2 -mr-2">
                              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                            {contact.fullName}
                          </div>
                          <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {contact.email}
                          </div>
                          {contact.phone && (
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {contact.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Message Details */}
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        <div className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                          {contact.subject}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {contact.message.substring(0, 100)}...
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full ${getStatusColor(contact.status)} shadow-sm`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          contact.status === 'new' ? 'bg-blue-500' :
                          contact.status === 'responded' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}></div>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(contact.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="group/btn inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <svg className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
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
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-500">No contacts match your current filter criteria.</p>
            </div>
          )}
        </div>

        {/* Enhanced Contact Detail Modal */}
        {showModal && selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Contact Details</h2>
                      <p className="text-blue-100 text-sm">View and manage contact information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <p className="text-lg text-gray-900 font-medium">{selectedContact.fullName}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <p className="text-lg text-gray-900 font-medium">{selectedContact.email}</p>
                  </div>

                  {selectedContact.phone && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <p className="text-lg text-gray-900 font-medium">{selectedContact.phone}</p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                    <p className="text-lg text-gray-900 font-medium">{selectedContact.subject}</p>
                  </div>
                </div>

                {/* Message Section */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Message</label>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedContact.message}</p>
                  </div>
                </div>

                {/* Status Management */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Status Management</label>
                  <div className="flex flex-wrap gap-3">
                    {['new', 'responded', 'closed'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedContact.id, status)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                          selectedContact.status === status
                            ? getStatusColor(status) + ' shadow-md'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Admin Notes</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    rows={4}
                    placeholder="Add your notes about this contact..."
                    value={selectedContact.adminNotes || ''}
                    onChange={(e) => {
                      const updatedContact = { ...selectedContact, adminNotes: e.target.value };
                      setSelectedContact(updatedContact);
                    }}
                  />
                  <button
                    onClick={() => handleUpdateStatus(selectedContact.id, selectedContact.status, selectedContact.adminNotes)}
                    className="mt-3 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Save Notes
                  </button>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Submitted:</span>
                      <span className="text-sm font-medium text-gray-900">{new Date(selectedContact.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedContact.updatedAt !== selectedContact.createdAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Last updated:</span>
                        <span className="text-sm font-medium text-gray-900">{new Date(selectedContact.updatedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContacts;
