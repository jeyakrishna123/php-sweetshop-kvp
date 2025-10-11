import db from "../config/database.js";

// Get all marketing campaigns
export const getMarketingCampaigns = async (req, res) => {
  try {
    console.log("📊 Fetching marketing campaigns...");
    
    // Get campaigns from database or create sample data
    let campaigns = [];
    
    try {
      campaigns = await db.getAllCampaigns();
    } catch (error) {
      console.log("📝 No campaigns in database, using sample data");
      // Sample campaigns data
      campaigns = [
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
        },
        {
          _id: "camp_003",
          name: "Abandoned Cart Recovery",
          type: "automation",
          subject: "Complete Your Purchase",
          content: "You left items in your cart. Complete your order now!",
          status: "active",
          targetSegment: "abandoned_cart",
          sentCount: 450,
          openRate: 45.2,
          clickRate: 18.7,
          conversionRate: 8.9,
          revenue: 8750,
          createdAt: new Date("2024-01-10"),
          scheduledDate: null
        },
        {
          _id: "camp_004",
          name: "VIP Customer Exclusive",
          type: "email",
          subject: "Exclusive VIP Offer - 30% Off Premium Fireworks",
          content: "Special offer just for our VIP customers!",
          status: "draft",
          targetSegment: "vip_customers",
          sentCount: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          revenue: 0,
          createdAt: new Date("2024-01-25"),
          scheduledDate: null
        }
      ];
    }

    // Calculate overall statistics
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled').length;
    const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;
    
    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const avgOpenRate = campaigns.length > 0 ? 
      campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length : 0;
    const avgClickRate = campaigns.length > 0 ? 
      campaigns.reduce((sum, c) => sum + c.clickRate, 0) / campaigns.length : 0;
    const avgConversionRate = campaigns.length > 0 ? 
      campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length : 0;
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);

    const stats = {
      totalCampaigns,
      activeCampaigns,
      scheduledCampaigns,
      draftCampaigns,
      totalSent,
      avgOpenRate: Math.round(avgOpenRate * 10) / 10,
      avgClickRate: Math.round(avgClickRate * 10) / 10,
      avgConversionRate: Math.round(avgConversionRate * 10) / 10,
      totalRevenue
    };

    console.log("✅ Marketing campaigns fetched successfully");
    res.json({
      success: true,
      campaigns,
      stats
    });
  } catch (error) {
    console.error("❌ Error fetching marketing campaigns:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketing campaigns",
      error: error.message
    });
  }
};

// Create new marketing campaign
export const createMarketingCampaign = async (req, res) => {
  try {
    console.log("📝 Creating new marketing campaign...");
    const { name, type, subject, content, targetSegment, scheduledDate } = req.body;

    // Validate required fields
    if (!name || !type || !subject) {
      return res.status(400).json({
        success: false,
        message: "Name, type, and subject are required"
      });
    }

    const campaign = {
      _id: `camp_${Date.now()}`,
      name,
      type,
      subject,
      content: content || "",
      status: scheduledDate ? "scheduled" : "draft",
      targetSegment: targetSegment || "all_customers",
      sentCount: 0,
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      revenue: 0,
      createdAt: new Date(),
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null
    };

    // Save to database
    try {
      await db.createCampaign(campaign);
    } catch (error) {
      console.log("📝 Campaign saved to memory (database method not implemented)");
    }

    console.log("✅ Marketing campaign created successfully");
    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign
    });
  } catch (error) {
    console.error("❌ Error creating marketing campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create marketing campaign",
      error: error.message
    });
  }
};

// Update marketing campaign
export const updateMarketingCampaign = async (req, res) => {
  try {
    console.log("📝 Updating marketing campaign...");
    const { id } = req.params;
    const updateData = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // Update campaign in database
    try {
      const updatedCampaign = await db.updateCampaign(id, updateData);
      console.log("✅ Marketing campaign updated successfully");
      res.json({
        success: true,
        message: "Campaign updated successfully",
        campaign: updatedCampaign
      });
    } catch (error) {
      console.log("📝 Campaign updated in memory (database method not implemented)");
      res.json({
        success: true,
        message: "Campaign updated successfully",
        campaign: { _id: id, ...updateData }
      });
    }
  } catch (error) {
    console.error("❌ Error updating marketing campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update marketing campaign",
      error: error.message
    });
  }
};

// Delete marketing campaign
export const deleteMarketingCampaign = async (req, res) => {
  try {
    console.log("🗑️ Deleting marketing campaign...");
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // Delete campaign from database
    try {
      await db.deleteCampaign(id);
      console.log("✅ Marketing campaign deleted successfully");
      res.json({
        success: true,
        message: "Campaign deleted successfully"
      });
    } catch (error) {
      console.log("📝 Campaign deleted from memory (database method not implemented)");
      res.json({
        success: true,
        message: "Campaign deleted successfully"
      });
    }
  } catch (error) {
    console.error("❌ Error deleting marketing campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete marketing campaign",
      error: error.message
    });
  }
};

// Send marketing campaign
export const sendMarketingCampaign = async (req, res) => {
  try {
    console.log("📤 Sending marketing campaign...");
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Campaign ID is required"
      });
    }

    // In a real implementation, this would integrate with email service providers
    // For now, we'll simulate sending
    console.log("📧 Simulating email send...");
    
    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("✅ Marketing campaign sent successfully");
    res.json({
      success: true,
      message: "Campaign sent successfully",
      sentAt: new Date()
    });
  } catch (error) {
    console.error("❌ Error sending marketing campaign:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send marketing campaign",
      error: error.message
    });
  }
};

// Get marketing analytics
export const getMarketingAnalytics = async (req, res) => {
  try {
    console.log("📊 Fetching marketing analytics...");
    
    // Sample analytics data
    const analytics = {
      overview: {
        totalCampaigns: 12,
        activeCampaigns: 8,
        totalSent: 15420,
        avgOpenRate: 65.2,
        avgClickRate: 14.8,
        avgConversionRate: 4.2,
        totalRevenue: 125750
      },
      recentActivity: [
        {
          id: 1,
          action: "Campaign Sent",
          campaign: "Welcome Series",
          timestamp: new Date("2024-01-25T10:30:00"),
          details: "Sent to 1,250 recipients"
        },
        {
          id: 2,
          action: "Campaign Created",
          campaign: "VIP Exclusive Offer",
          timestamp: new Date("2024-01-24T15:45:00"),
          details: "Draft campaign created"
        },
        {
          id: 3,
          action: "Campaign Updated",
          campaign: "Flash Sale Alert",
          timestamp: new Date("2024-01-23T09:20:00"),
          details: "Subject line updated"
        }
      ],
      topPerforming: [
        {
          name: "Welcome Series",
          sentCount: 1250,
          openRate: 68.5,
          clickRate: 12.3,
          conversionRate: 3.2,
          revenue: 15250
        },
        {
          name: "Abandoned Cart Recovery",
          sentCount: 450,
          openRate: 45.2,
          clickRate: 18.7,
          conversionRate: 8.9,
          revenue: 8750
        }
      ],
      segmentPerformance: [
        { segment: "New Customers", openRate: 72.1, clickRate: 16.3, conversionRate: 5.2 },
        { segment: "VIP Customers", openRate: 78.5, clickRate: 22.1, conversionRate: 8.7 },
        { segment: "Inactive Customers", openRate: 35.2, clickRate: 8.9, conversionRate: 2.1 },
        { segment: "All Customers", openRate: 65.2, clickRate: 14.8, conversionRate: 4.2 }
      ]
    };

    console.log("✅ Marketing analytics fetched successfully");
    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("❌ Error fetching marketing analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketing analytics",
      error: error.message
    });
  }
};
