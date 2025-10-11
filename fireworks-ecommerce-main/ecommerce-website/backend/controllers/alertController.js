import db from '../database.js';

// Smart Alert System Controller
export const getAlerts = async (req, res) => {
  try {
    // Mock alert data - in production, this would come from a real alert system
    const alerts = [
      {
        id: 1,
        type: 'High Sales Volume',
        message: 'Sales exceeded $50,000 in the last hour',
        severity: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'active',
        channel: 'email',
        acknowledged: false
      },
      {
        id: 2,
        type: 'Low Inventory',
        message: 'Diwali Crackers stock below 10 units',
        severity: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'active',
        channel: 'push',
        acknowledged: false
      },
      {
        id: 3,
        type: 'Customer Churn',
        message: '15 customers cancelled orders in the last 2 hours',
        severity: 'high',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'active',
        channel: 'whatsapp',
        acknowledged: true
      },
      {
        id: 4,
        type: 'Payment Failure',
        message: 'Payment gateway error rate above 5%',
        severity: 'critical',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'resolved',
        channel: 'email',
        acknowledged: true
      }
    ];

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    // In production, this would update the alert status in the database
    console.log(`Alert ${alertId} acknowledged`);
    
    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert'
    });
  }
};

export const getAlertRules = async (req, res) => {
  try {
    // Mock alert rules data
    const rules = [
      {
        id: 1,
        name: 'High Sales Alert',
        condition: 'sales > 50000',
        threshold: '50000',
        channel: 'email',
        frequency: 'immediate',
        enabled: true,
        lastTriggered: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 2,
        name: 'Low Stock Alert',
        condition: 'inventory < 10',
        threshold: '10',
        channel: 'push',
        frequency: 'hourly',
        enabled: true,
        lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 3,
        name: 'Customer Churn Alert',
        condition: 'cancellations > 10',
        threshold: '10',
        channel: 'whatsapp',
        frequency: 'immediate',
        enabled: true,
        lastTriggered: new Date(Date.now() - 3 * 60 * 60 * 1000)
      }
    ];

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error('Error fetching alert rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert rules'
    });
  }
};

export const createAlertRule = async (req, res) => {
  try {
    const { name, condition, threshold, channel, frequency, enabled } = req.body;
    
    // In production, this would save the rule to the database
    const newRule = {
      id: Date.now(),
      name,
      condition,
      threshold,
      channel,
      frequency,
      enabled: enabled !== false,
      lastTriggered: null
    };
    
    res.json({
      success: true,
      data: newRule,
      message: 'Alert rule created successfully'
    });
  } catch (error) {
    console.error('Error creating alert rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert rule'
    });
  }
};

export const updateAlertRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const updates = req.body;
    
    // In production, this would update the rule in the database
    console.log(`Updating alert rule ${ruleId}:`, updates);
    
    res.json({
      success: true,
      message: 'Alert rule updated successfully'
    });
  } catch (error) {
    console.error('Error updating alert rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert rule'
    });
  }
};

export const deleteAlertRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    
    // In production, this would delete the rule from the database
    console.log(`Deleting alert rule ${ruleId}`);
    
    res.json({
      success: true,
      message: 'Alert rule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert rule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert rule'
    });
  }
};
