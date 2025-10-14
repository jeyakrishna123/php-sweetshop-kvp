import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../axios';

const AdminHideSections = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [hiddenSections, setHiddenSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    sectionName: '',
    sectionType: '',
    pagePath: 'all',
    isHidden: true,
    reason: ''
  });

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'categories', label: 'Categories' },
    { value: 'products', label: 'Products' },
    { value: 'testimonials', label: 'Testimonials' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'footer', label: 'Footer' },
    { value: 'navbar', label: 'Navigation Bar' },
    { value: 'sidebar', label: 'Sidebar' },
    { value: 'banner', label: 'Banner' },
    { value: 'features', label: 'Features' },
    { value: 'about', label: 'About Section' },
    { value: 'contact', label: 'Contact Section' },
    { value: 'team', label: 'Team Section' }
  ];

  const pagePaths = [
    { value: 'all', label: 'All Pages' },
    { value: '/', label: 'Homepage' },
    { value: '/products', label: 'Products Page' },
    { value: '/about', label: 'About Page' },
    { value: '/contact', label: 'Contact Page' },
    { value: '/admin', label: 'Admin Panel' }
  ];

  useEffect(() => {
    fetchHiddenSections();
  }, []);

  const fetchHiddenSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/hide-sections');
      if (response.data.success && Array.isArray(response.data.data?.sections)) {
        const sortedSections = response.data.data.sections.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setHiddenSections(sortedSections);
      } else {
        // Response was successful but data is missing or invalid
        setHiddenSections([]);
      }
    } catch (error) {
      console.error('Error fetching hidden sections:', error);
      showToast('Failed to fetch hidden sections', 'error');
      setHiddenSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSection) {
        const response = await axios.put(`/api/hide-sections/${editingSection.id}`, formData);
        if (response.data.success) {
          showToast('Hidden section updated successfully', 'success');
          setHiddenSections(prev => prev.map(section => 
            section.id === editingSection.id ? response.data.hiddenSection : section
          ));
        }
      } else {
        const response = await axios.post('/api/hide-sections', formData);
        if (response.data.success) {
          showToast('Section hidden successfully', 'success');
          setHiddenSections(prev => [response.data.hiddenSection, ...prev]);
        }
      }
      setShowModal(false);
      setEditingSection(null);
      setFormData({
        sectionName: '',
        sectionType: '',
        pagePath: 'all',
        isHidden: true,
        reason: ''
      });
    } catch (error) {
      console.error('Error saving hidden section:', error);
      showToast('Failed to save hidden section', 'error');
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      sectionName: section.sectionName,
      sectionType: section.sectionType,
      pagePath: section.pagePath,
      isHidden: section.isHidden,
      reason: section.reason || ''
    });
    setShowModal(true);
  };

  const handleToggleVisibility = async (sectionId) => {
    try {
      const response = await axios.put(`/api/hide-sections/${sectionId}/toggle`);
      if (response.data.success) {
        showToast(response.data.message, 'success');
        setHiddenSections(prev => prev.map(section => 
          section.id === sectionId ? response.data.hiddenSection : section
        ));
      }
    } catch (error) {
      console.error('Error toggling section visibility:', error);
      showToast('Failed to toggle section visibility', 'error');
    }
  };

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this hidden section?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/hide-sections/${sectionId}`);
      if (response.data.success) {
        showToast('Hidden section deleted successfully', 'success');
        setHiddenSections(prev => prev.filter(section => section.id !== sectionId));
      }
    } catch (error) {
      console.error('Error deleting hidden section:', error);
      showToast('Failed to delete hidden section', 'error');
    }
  };

  const getStatusColor = (isHidden) => {
    return isHidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getStatusText = (isHidden) => {
    return isHidden ? 'Hidden' : 'Visible';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hide Sections Management</h1>
        <p className="text-gray-600">Control the visibility of sections across all pages</p>
      </div>

      {/* Add New Section Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingSection(null);
            setFormData({
              sectionName: '',
              sectionType: '',
              pagePath: 'all',
              isHidden: true,
              reason: ''
            });
            setShowModal(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          + Hide New Section
        </button>
      </div>

      {/* Hidden Sections List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hiddenSections.map((section) => (
                <tr key={section.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {section.sectionName}
                    </div>
                    <div className="text-sm text-gray-500">{section.sectionType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {section.pagePath === 'all' ? 'All Pages' : section.pagePath}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(section.isHidden)}`}>
                      {getStatusText(section.isHidden)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {section.reason || 'No reason provided'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(section.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleVisibility(section.id)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          section.isHidden 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {section.isHidden ? 'Show' : 'Hide'}
                      </button>
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-900"
                      >
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingSection ? 'Edit Hidden Section' : 'Hide New Section'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  name="sectionName"
                  value={formData.sectionName}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter section name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Type *
                </label>
                <select
                  name="sectionType"
                  value={formData.sectionType}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select section type</option>
                  {sectionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Path
                </label>
                <select
                  name="pagePath"
                  value={formData.pagePath}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {pagePaths.map(page => (
                    <option key={page.value} value={page.value}>
                      {page.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter reason for hiding this section"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isHidden"
                  checked={formData.isHidden}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Hide this section
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {editingSection ? 'Update' : 'Hide Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHideSections;
