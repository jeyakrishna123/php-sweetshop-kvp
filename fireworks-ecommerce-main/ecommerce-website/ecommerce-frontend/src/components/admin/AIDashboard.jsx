import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  TrendingUp,
  Psychology,
  Inventory,
  Security,
  Chat,
  Analytics,
  PriceChange,
  ExpandMore,
  Send,
  Insights,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = 'http://localhost:8000/api/admin/ai';

const AIDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadAIData();
  }, [activeTab]);

  const loadAIData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        { key: 'analytics', url: `${API_BASE}/analytics` },
        { key: 'insights', url: `${API_BASE}/smart-insights` },
        { key: 'recommendations', url: `${API_BASE}/recommendations?type=trending` },
        { key: 'inventory', url: `${API_BASE}/inventory-optimization` },
        { key: 'fraud', url: `${API_BASE}/fraud-analysis` },
        { key: 'behavior', url: `${API_BASE}/customer-behavior` },
        { key: 'pricing', url: `${API_BASE}/price-optimization` }
      ];

      const responses = await Promise.allSettled(
        endpoints.map(endpoint => 
          axios.get(endpoint.url, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        )
      );

      const newData = {};
      endpoints.forEach((endpoint, index) => {
        if (responses[index].status === 'fulfilled') {
          newData[endpoint.key] = responses[index].value.data.data;
        }
      });

      setAiData(newData);
    } catch (error) {
      console.error('Error loading AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = { role: 'user', content: chatMessage, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      const response = await axios.post(`${API_BASE}/chat`, {
        message: chatMessage,
        context: aiData
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const aiMessage = { 
        role: 'assistant', 
        content: response.data.data.response, 
        timestamp: new Date() 
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const renderPredictiveAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <TrendingUp /> Sales Forecast
            </Typography>
            {aiData.analytics?.predictions?.salesForecast && (
              <Line
                data={{
                  labels: aiData.analytics.predictions.salesForecast.map(item => item.month),
                  datasets: [
                    {
                      label: 'Predicted Sales',
                      data: aiData.analytics.predictions.salesForecast.map(item => item.predicted),
                      borderColor: 'rgb(75, 192, 192)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      fill: true
                    },
                    {
                      label: 'Actual Sales',
                      data: aiData.analytics.predictions.salesForecast.map(item => item.actual),
                      borderColor: 'rgb(255, 99, 132)',
                      backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₹' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Customer Growth Prediction
            </Typography>
            {aiData.analytics?.predictions?.customerGrowth && (
              <Box>
                <Typography variant="h4" color="primary">
                  {aiData.analytics.predictions.customerGrowth.predicted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expected customers next month
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2">
                    Growth Rate: {aiData.analytics.predictions.customerGrowth.growthRate}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={aiData.analytics.predictions.customerGrowth.confidence} 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption">
                    Confidence: {aiData.analytics.predictions.customerGrowth.confidence}%
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Warning /> Anomaly Detection
            </Typography>
            {aiData.analytics?.anomalies?.detected?.map((anomaly, index) => (
              <Alert 
                key={index}
                severity={anomaly.severity === 'High' ? 'error' : 'warning'}
                sx={{ mb: 1 }}
              >
                <strong>{anomaly.type}</strong> on {anomaly.date}: 
                ₹{anomaly.value.toLocaleString()} (Normal: ₹{anomaly.normal.toLocaleString()})
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderSmartInsights = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Insights /> Key Performance Insights
            </Typography>
            {aiData.insights?.key_metrics && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h5" color="primary">
                      ₹{aiData.insights.key_metrics.total_revenue?.toLocaleString()}
                    </Typography>
                    <Typography variant="caption">Total Revenue</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" color="secondary">
                      {aiData.insights.key_metrics.total_orders}
                    </Typography>
                    <Typography variant="caption">Total Orders</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" color="success.main">
                      ₹{aiData.insights.key_metrics.avg_order_value}
                    </Typography>
                    <Typography variant="caption">Avg Order Value</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h5" color="info.main">
                      {aiData.insights.key_metrics.customer_count}
                    </Typography>
                    <Typography variant="caption">Customers</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Recommendations
            </Typography>
            {aiData.insights?.recommendations && (
              <Box>
                {Object.entries(aiData.insights.recommendations).map(([category, recs]) => (
                  <Accordion key={category}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                        {category.replace('_', ' ')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {recs.map((rec, index) => (
                        <Chip 
                          key={index}
                          label={rec}
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Trend Analysis
            </Typography>
            {aiData.insights?.trends && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      +{aiData.insights.trends.revenue_growth?.monthly || 0}%
                    </Typography>
                    <Typography variant="caption">Monthly Revenue Growth</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info.main">
                      +{aiData.insights.trends.customer_growth?.new_customers_this_month || 0}
                    </Typography>
                    <Typography variant="caption">New Customers</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {aiData.insights.alerts?.low_stock || 0}
                    </Typography>
                    <Typography variant="caption">Low Stock Items</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProductRecommendations = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Psychology /> AI Product Recommendations
            </Typography>
            {aiData.recommendations?.recommendations?.map((product, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={8}>
                    <Typography variant="subtitle1">{product.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.reason}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`Score: ${product.similarity_score?.toFixed(1) || product.recommendation_score?.toFixed(1)}%`}
                      color="primary"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={4} textAlign="right">
                    <Typography variant="h6">₹{product.price?.toLocaleString()}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stock: {product.stock}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recommendation Types
            </Typography>
            <Box>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 1 }}
                onClick={() => loadRecommendations('similar')}
              >
                Similar Products
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 1 }}
                onClick={() => loadRecommendations('trending')}
              >
                Trending Items
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 1 }}
                onClick={() => loadRecommendations('cross_sell')}
              >
                Cross-sell Opportunities
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                onClick={() => loadRecommendations('personalized')}
              >
                Personalized
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderInventoryOptimization = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Inventory /> Stock Alerts
            </Typography>
            {aiData.inventory?.stock_alerts?.map((alert, index) => (
              <Alert key={index} severity={alert.urgency === 'Critical' ? 'error' : 'warning'} sx={{ mb: 1 }}>
                <strong>{alert.product_name}</strong>: {alert.current_stock} units left 
                ({alert.days_remaining} days remaining)
              </Alert>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Reorder Recommendations
            </Typography>
            {aiData.inventory?.reorder_recommendations?.map((rec, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle1">{rec.product_name}</Typography>
                <Typography variant="body2">
                  Suggested quantity: {rec.suggested_quantity} units
                </Typography>
                <Typography variant="body2" color="success.main">
                  Estimated cost: ₹{rec.estimated_cost?.toLocaleString()}
                </Typography>
                <Chip 
                  size="small" 
                  label={`Priority: ${rec.priority_score}`} 
                  color="primary" 
                />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inventory Performance Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Fast Moving Items</Typography>
                {aiData.inventory?.fast_moving_items?.map((item, index) => (
                  <Box key={index} sx={{ p: 1, bgcolor: 'success.light', mb: 1, borderRadius: 1 }}>
                    <Typography variant="body2">{item.product_name}</Typography>
                    <Typography variant="caption">Velocity: {item.velocity}</Typography>
                  </Box>
                ))}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Slow Moving Items</Typography>
                {aiData.inventory?.slow_moving_items?.map((item, index) => (
                  <Box key={index} sx={{ p: 1, bgcolor: 'warning.light', mb: 1, borderRadius: 1 }}>
                    <Typography variant="body2">{item.product_name}</Typography>
                    <Typography variant="caption">{item.recommendation}</Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderFraudDetection = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <Security /> Fraud Risk Analysis
            </Typography>
            {aiData.fraud && (
              <Box>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Typography variant="h3" 
                    color={
                      aiData.fraud.risk_level === 'High' ? 'error.main' : 
                      aiData.fraud.risk_level === 'Medium' ? 'warning.main' : 'success.main'
                    }
                  >
                    {aiData.fraud.risk_score}
                  </Typography>
                  <Typography variant="h6">Risk Score</Typography>
                  <Chip 
                    label={`${aiData.fraud.risk_level} Risk`}
                    color={
                      aiData.fraud.risk_level === 'High' ? 'error' : 
                      aiData.fraud.risk_level === 'Medium' ? 'warning' : 'success'
                    }
                  />
                </Box>

                <Typography variant="subtitle1" gutterBottom>Risk Factors:</Typography>
                {aiData.fraud.risk_factors?.map((factor, index) => (
                  <Chip key={index} label={factor} variant="outlined" sx={{ mr: 1, mb: 1 }} />
                ))}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Recommendations:
                </Typography>
                {aiData.fraud.recommendations?.map((rec, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    {rec}
                  </Alert>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Metrics
            </Typography>
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Fraud Detection Rate</Typography>
                <LinearProgress variant="determinate" value={94} color="success" />
                <Typography variant="caption">94%</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">False Positive Rate</Typography>
                <LinearProgress variant="determinate" value={8} color="warning" />
                <Typography variant="caption">8%</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">System Confidence</Typography>
                <LinearProgress variant="determinate" value={87} color="primary" />
                <Typography variant="caption">87%</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPriceOptimization = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <PriceChange /> Price Optimization
            </Typography>
            {aiData.pricing && (
              <Box>
                <Typography variant="subtitle1">Current Price: ₹{aiData.pricing.current_price}</Typography>
                
                {aiData.pricing.recommendations?.map((rec, index) => (
                  <Box key={index} sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1">{rec.strategy}</Typography>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="h5" color="primary">
                          ₹{rec.suggested_price?.toLocaleString()}
                        </Typography>
                        <Typography variant="caption">Suggested Price</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" color="success.main">
                          {rec.expected_impact}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={`${rec.risk_level} Risk`}
                          color={rec.risk_level === 'High' ? 'error' : rec.risk_level === 'Medium' ? 'warning' : 'success'}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Price Analytics
            </Typography>
            {aiData.pricing?.price_elasticity && (
              <Box>
                <Typography variant="body2">Price Elasticity</Typography>
                <Typography variant="h4" color="primary">
                  {aiData.pricing.price_elasticity.elasticity_coefficient}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {aiData.pricing.price_elasticity.interpretation}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const loadRecommendations = async (type) => {
    try {
      const response = await axios.get(`${API_BASE}/recommendations?type=${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAiData(prev => ({ ...prev, recommendations: response.data.data }));
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const tabs = [
    { label: 'Predictive Analytics', icon: <TrendingUp />, content: renderPredictiveAnalytics },
    { label: 'Smart Insights', icon: <Insights />, content: renderSmartInsights },
    { label: 'Recommendations', icon: <Psychology />, content: renderProductRecommendations },
    { label: 'Inventory AI', icon: <Inventory />, content: renderInventoryOptimization },
    { label: 'Fraud Detection', icon: <Security />, content: renderFraudDetection },
    { label: 'Price Optimization', icon: <PriceChange />, content: renderPriceOptimization }
  ];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          AI Dashboard
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Chat />}
            onClick={() => setChatOpen(true)}
            sx={{ mr: 1 }}
          >
            AI Assistant
          </Button>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={loadAIData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={index}
              label={tab.label} 
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      <Box>
        {tabs[activeTab]?.content()}
      </Box>

      {/* AI Chat Dialog */}
      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Chat sx={{ mr: 1 }} />
            AI Assistant
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400, overflowY: 'auto', mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            {chatHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
                Hello! I'm your AI assistant. Ask me about sales, inventory, customers, or any business insights.
              </Typography>
            ) : (
              chatHistory.map((message, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' 
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                      color: message.role === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder="Ask me anything about your business..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            />
            <IconButton onClick={handleChatSend} color="primary">
              <Send />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AIDashboard;