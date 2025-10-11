import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../axios";
import { getApiConfig } from "../config/api";

const AdminMarketing = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [campaignConfig, setCampaignConfig] = useState({
    name: "",
    type: "email",
    subject: "",
    content: "",
    targetSegment: "all_customers",
    scheduledDate: ""
  });

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    try {
      setLoading(true);
      const [campaignsResponse, analyticsResponse] = await Promise.all([
        axios.get(`${getApiConfig().BASE_URL}/api/admin/marketing`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        }),
        axios.get(`${getApiConfig().BASE_URL}/api/admin/marketing/analytics`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        })
      ]);
      
      setCampaigns(campaignsResponse.data.campaigns || []);
      setAnalytics(analyticsResponse.data.analytics);
    } catch (error) {
      console.error("Failed to fetch marketing data:", error);
      // Fallback to sample data
        setCampaigns([
          {
          _id: "camp_001",
            name: "Welcome Series",
            type: "email",
          subject: "Welcome to FireworksHub!",
          content: "Welcome to our amazing fireworks store!",
            status: "active",
          targetSegment: "new_customers",
            sentCount: 1250,
            openRate: 68.5,
            clickRate: 12.3,
          conversionRate: 3.2,
          revenue: 15250,
          createdAt: new Date("2024-01-15"),
          scheduledDate: null
          },
          {
          _id: "camp_002",
            name: "Flash Sale Alert",
            type: "email",
            subject: "24-Hour Flash Sale - 50% Off!",
          content: "Don't miss our biggest sale of the year!",
            status: "scheduled",
          targetSegment: "all_customers",
            sentCount: 0,
            openRate: 0,
            clickRate: 0,
          conversionRate: 0,
          revenue: 0,
          createdAt: new Date("2024-01-20"),
          scheduledDate: new Date("2024-02-01")
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!campaignConfig.name.trim()) {
      errors.name = "Campaign name is required";
    } else if (campaignConfig.name.trim().length < 3) {
      errors.name = "Campaign name must be at least 3 characters";
    }
    
    if (!campaignConfig.subject.trim()) {
      errors.subject = "Subject line is required";
    } else if (campaignConfig.subject.trim().length < 5) {
      errors.subject = "Subject line must be at least 5 characters";
    }
    
    if (!campaignConfig.content.trim()) {
      errors.content = "Content is required";
    } else if (campaignConfig.content.trim().length < 10) {
      errors.content = "Content must be at least 10 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setCampaignConfig(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const createCampaign = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await axios.post(`${getApiConfig().BASE_URL}/api/admin/marketing`, campaignConfig, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setShowCreateForm(false);
      resetForm();
      fetchMarketingData();
      alert("Campaign created successfully!");
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCampaign = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      await axios.put(`${getApiConfig().BASE_URL}/api/admin/marketing/${editingCampaign._id}`, campaignConfig, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setEditingCampaign(null);
      resetForm();
      fetchMarketingData();
      alert("Campaign updated successfully!");
    } catch (error) {
      console.error("Failed to update campaign:", error);
      alert("Failed to update campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCampaign = async (campaignId) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      await axios.delete(`${getApiConfig().BASE_URL}/api/admin/marketing/${campaignId}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      fetchMarketingData();
      alert("Campaign deleted successfully!");
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign");
    }
  };

  const sendCampaign = async (campaignId) => {
    if (!confirm("Are you sure you want to send this campaign?")) return;
    
    try {
      await axios.post(`${getApiConfig().BASE_URL}/api/admin/marketing/${campaignId}/send`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      fetchMarketingData();
      alert("Campaign sent successfully!");
    } catch (error) {
      console.error("Failed to send campaign:", error);
      alert("Failed to send campaign");
    }
  };

  const resetForm = () => {
      setCampaignConfig({
        name: "",
        type: "email",
        subject: "",
      content: "",
      targetSegment: "all_customers",
        scheduledDate: ""
      });
    setFormErrors({});
    setIsSubmitting(false);
  };

  const openEditForm = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignConfig({
      name: campaign.name,
      type: campaign.type,
      subject: campaign.subject,
      content: campaign.content,
      targetSegment: campaign.targetSegment,
      scheduledDate: campaign.scheduledDate ? new Date(campaign.scheduledDate).toISOString().split('T')[0] : ""
    });
    setShowCreateForm(true);
  };

  const closeForm = () => {
    setShowCreateForm(false);
    setEditingCampaign(null);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-50 border-green-200";
      case "scheduled": return "text-blue-600 bg-blue-50 border-blue-200";
      case "draft": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "email": return "📧";
      case "sms": return "📱";
      case "push": return "🔔";
      case "automation": return "🤖";
      default: return "📧";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketing Automation</h1>
              <p className="text-gray-600 mt-1">Manage email campaigns and customer segmentation</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition duration-200 flex items-center space-x-2"
            >
              <span>+</span>
              <span>Create Campaign</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("campaigns")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "campaigns"
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-pink-500 text-pink-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Campaigns Tab */}
        {activeTab === "campaigns" && (
          <div className="space-y-6">
            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getTypeIcon(campaign.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-500">{campaign.subject}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{campaign.sentCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{campaign.openRate}%</p>
                      <p className="text-xs text-gray-500">Open Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{campaign.clickRate}%</p>
                      <p className="text-xs text-gray-500">Click Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-pink-600">{campaign.conversionRate}%</p>
                      <p className="text-xs text-gray-500">Conversion</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditForm(campaign)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition duration-200"
                    >
                      Edit
                    </button>
                    {campaign.status === "draft" && (
                      <button
                        onClick={() => sendCampaign(campaign._id)}
                        className="flex-1 bg-pink-600 text-white px-3 py-2 rounded-md text-sm hover:bg-pink-700 transition duration-200"
                      >
                        Send
                      </button>
                    )}
                    <button
                      onClick={() => deleteCampaign(campaign._id)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-500 mb-6">Create your first marketing campaign to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition duration-200"
                >
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCampaigns}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgOpenRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgClickRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
        </div>

            {/* Top Performing Campaigns */}
          <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
              <div className="space-y-4">
                {analytics.topPerforming.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-pink-600">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                        <p className="text-sm text-gray-500">Sent to {campaign.sentCount.toLocaleString()} recipients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{campaign.openRate}% Open Rate</p>
                      <p className="text-sm text-gray-500">₹{campaign.revenue.toLocaleString()} Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeForm}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📧</span>
                    <h3 className="text-lg font-semibold text-white">
                      {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
                    </h3>
                  </div>
                  <button
                    onClick={closeForm}
                    className="text-white hover:text-gray-200 transition duration-200"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              <div className="bg-white px-6 py-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={campaignConfig.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter campaign name"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        formErrors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                />
                    {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
                <select
                  value={campaignConfig.type}
                      onChange={(e) => handleInputChange("type", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="email">Email Campaign</option>
                  <option value="sms">SMS Campaign</option>
                  <option value="push">Push Notification</option>
                      <option value="automation">Automation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={campaignConfig.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Enter subject line"
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        formErrors.subject ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {formErrors.subject && <p className="text-red-600 text-sm mt-1">{formErrors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={campaignConfig.content}
                      onChange={(e) => handleInputChange("content", e.target.value)}
                      placeholder="Enter campaign content"
                      rows={4}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        formErrors.content ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {formErrors.content && <p className="text-red-600 text-sm mt-1">{formErrors.content}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Segment</label>
                <select
                  value={campaignConfig.targetSegment}
                      onChange={(e) => handleInputChange("targetSegment", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                      <option value="all_customers">All Customers</option>
                      <option value="new_customers">New Customers</option>
                      <option value="vip_customers">VIP Customers</option>
                      <option value="inactive_customers">Inactive Customers</option>
                      <option value="abandoned_cart">Abandoned Cart</option>
                </select>
              </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Date (Optional)</label>
                    <input
                      type="date"
                      value={campaignConfig.scheduledDate}
                      onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
            </div>
          </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={closeForm}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition duration-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingCampaign ? updateCampaign : createCampaign}
                    disabled={isSubmitting}
                    className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{editingCampaign ? "Update Campaign" : "Create Campaign"}</span>
                    </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
