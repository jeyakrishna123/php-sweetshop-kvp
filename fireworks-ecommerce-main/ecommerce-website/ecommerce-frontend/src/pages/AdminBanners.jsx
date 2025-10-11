import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BannerModal from '../components/BannerModal';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { bannerAPI } from '../utils/adminAPI';
import { getImageUrl } from '../utils/imageUtils';
import { exportToCSV } from '../utils/exportUtils';

const AdminBanners = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Check admin access
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      showToast('Access denied. Admin privileges required.', 'error');
      return;
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerAPI.getAllBanners();
      if (response.success) {
        setBanners(response.banners);
        // Save to localStorage for frontend access
        localStorage.setItem('banners', JSON.stringify(response.banners));
        console.log('💾 Banners saved to localStorage:', response.banners.length);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      showToast('Failed to fetch banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = async (formData) => {
    setOperationLoading(true);
    try {
      if (editingBanner) {
        // Update existing banner
        const response = await bannerAPI.updateBanner(editingBanner._id, formData);
        if (response.success) {
          showToast('Banner updated successfully', 'success');
          await fetchBanners();
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('bannersUpdated'));
        }
      } else {
        // Create new banner
        const response = await bannerAPI.createBanner(formData);
        if (response.success) {
          showToast('Banner created successfully', 'success');
          await fetchBanners();
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('bannersUpdated'));
        }
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      showToast(error.message, 'error');
      throw error;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return;
    }

    setOperationLoading(true);
    try {
      const response = await bannerAPI.deleteBanner(bannerId);
      if (response.success) {
        showToast('Banner deleted successfully', 'success');
        await fetchBanners();
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('bannersUpdated'));
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      showToast(error.message, 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleStatus = async (bannerId) => {
    try {
      const response = await bannerAPI.toggleBannerStatus(bannerId);
      if (response.success) {
        showToast(response.message, 'success');
        await fetchBanners();
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('bannersUpdated'));
      }
    } catch (error) {
      console.error('Error toggling banner status:', error);
      showToast(error.message, 'error');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBanners(items);

    // Update display order based on new positions
    const bannerIds = items.map((banner, index) => banner._id);
    
    try {
      const response = await bannerAPI.reorderBanners(bannerIds);
      if (response.success) {
        showToast('Banner order updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error reordering banners:', error);
      showToast(error.message, 'error');
      fetchBanners(); // Revert to original order
    }
  };

  const openCreateModal = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  // Export banners to CSV
  const handleExportBanners = () => {
    try {
      const exportData = banners.map(banner => ({
        ID: banner._id,
        Title: banner.title,
        Description: banner.description,
        'Link URL': banner.linkUrl,
        'Is Active': banner.isActive ? 'Yes' : 'No',
        'Display Order': banner.displayOrder,
        'Image URL': banner.imageUrl,
        'Created At': new Date(banner.createdAt).toLocaleDateString(),
        'Updated At': new Date(banner.updatedAt).toLocaleDateString()
      }));
      
      exportToCSV(exportData, `banners_${new Date().toISOString().split('T')[0]}`);
      showToast(`Exported ${banners.length} banners successfully`, 'success');
    } catch (error) {
      showToast(`Export failed: ${error.message}`, 'error');
    }
  };

  // Bulk actions for banners
  const handleShowAllBanners = async () => {
    const hiddenBanners = banners.filter(b => !b.isActive);
    for (const banner of hiddenBanners) {
      await handleToggleStatus(banner._id);
    }
  };

  const handleHideAllBanners = async () => {
    const visibleBanners = banners.filter(b => b.isActive);
    for (const banner of visibleBanners) {
      await handleToggleStatus(banner._id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">🎨</span>
              Banner Management
            </h1>
            <p className="text-gray-600 mt-2">Create and manage promotional banners for your website</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchBanners}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            {banners.length > 0 && (
              <button
                onClick={handleExportBanners}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={openCreateModal}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add New Banner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Banners</p>
              <p className="text-3xl font-bold">{banners.length}</p>
              <p className="text-blue-200 text-sm mt-1">All created banners</p>
            </div>
            <div className="text-4xl opacity-80">🎨</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Visible Banners</p>
              <p className="text-3xl font-bold">{banners.filter(b => b.isActive).length}</p>
              <p className="text-green-200 text-sm mt-1">Currently showing on website</p>
            </div>
            <div className="text-4xl opacity-80">👁️</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100">Hidden Banners</p>
              <p className="text-3xl font-bold">{banners.filter(b => !b.isActive).length}</p>
              <p className="text-gray-200 text-sm mt-1">Currently hidden from website</p>
            </div>
            <div className="text-4xl opacity-80">🙈</div>
          </div>
        </div>
      </div>

      {/* Banner Management */}
      <div className="bg-white rounded-lg shadow-sm relative">
        {operationLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">Processing...</span>
            </div>
          </div>
        )}
        
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">🎯 Banner Display Control</h2>
              <p className="text-sm text-gray-600 mt-1">
                Drag to reorder • Click visibility button to show/hide • First banner displays prominently
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleShowAllBanners}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                disabled={banners.filter(b => !b.isActive).length === 0}
              >
                👁️ Show All
              </button>
              <button
                onClick={handleHideAllBanners}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                disabled={banners.filter(b => b.isActive).length === 0}
              >
                🙈 Hide All
              </button>
            </div>
          </div>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No banners created yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create attractive banners to promote your products and special offers on your website homepage.
            </p>
            <button
              onClick={openCreateModal}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <span>➕</span>
              <span>Create Your First Banner</span>
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="banners">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-200"
                  >
                    {banners.map((banner, index) => (
                      <Draggable key={banner._id} draggableId={banner._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-6 hover:bg-gray-50 transition-colors ${
                              snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="flex-shrink-0 cursor-move p-2 hover:bg-gray-100 rounded"
                              >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>

                              {/* Banner Image */}
                              <div className="flex-shrink-0">
                                <img
                                  src={`${getImageUrl(banner.mobileImageUrl || banner.desktopImageUrl || banner.imageUrl)}?t=${Date.now()}`}
                                  alt={banner.title}
                                  className="w-24 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    console.log('❌ Admin banner image failed to load:', e.target.src);
                                    e.target.src = 'https://via.placeholder.com/96x64?text=No+Image';
                                  }}
                                />
                                {banner.deviceType === 'both' && (
                                  <div className="mt-1 text-xs text-gray-500 text-center">
                                    {banner.mobileImageUrl ? '📱' : '❌'} {banner.desktopImageUrl ? '💻' : '❌'}
                                  </div>
                                )}
                              </div>

                              {/* Banner Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h3 className="text-lg font-medium text-gray-900 truncate">
                                    {banner.title || 'Untitled Banner'}
                                  </h3>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    banner.isActive
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {banner.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    banner.deviceType === 'mobile'
                                      ? 'bg-green-100 text-green-800'
                                      : banner.deviceType === 'desktop'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {banner.deviceType === 'mobile' ? '📱 Mobile' : 
                                     banner.deviceType === 'desktop' ? '💻 Desktop' : 
                                     '📱💻 Both'}
                                  </span>
                                </div>
                                {banner.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {banner.description}
                                  </p>
                                )}
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>Order: {banner.displayOrder}</span>
                                  {banner.linkUrl && (
                                    <span className="truncate">Link: {banner.linkUrl}</span>
                                  )}
                                  <span>Created: {new Date(banner.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex-shrink-0 flex items-center space-x-2">
                                {/* Visibility Toggle - More User Friendly */}
                                <button
                                  onClick={() => handleToggleStatus(banner._id)}
                                  disabled={operationLoading}
                                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                                    banner.isActive
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  } ${operationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={banner.isActive ? 'Hide banner from website' : 'Show banner on website'}
                                >
                                  {banner.isActive ? (
                                    <>
                                      <span>👁️</span>
                                      <span>Visible</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>🙈</span>
                                      <span>Hidden</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleEditBanner(banner)}
                                  disabled={operationLoading}
                                  className={`px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1 ${operationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Edit Banner"
                                >
                                  <span>✏️</span>
                                  <span className="text-sm">Edit</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteBanner(banner._id)}
                                  disabled={operationLoading}
                                  className={`px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1 ${operationLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Delete Banner"
                                >
                                  <span>🗑️</span>
                                  <span className="text-sm">Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
        )}
      </div>

      {/* Banner Modal */}
      <BannerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        banner={editingBanner}
        onSave={handleSaveBanner}
      />
    </div>
  );
};

export default AdminBanners;
