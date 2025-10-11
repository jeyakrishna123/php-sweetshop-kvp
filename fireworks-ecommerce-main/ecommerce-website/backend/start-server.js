// Very Simple Server
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/upload/test', (req, res) => {
  console.log('✅ Test route working!');
  res.json({ success: true, message: 'Server is running!' });
});

// Offer popups route
app.get('/api/offer-popups', (req, res) => {
  console.log('✅ Offer popups route working!');
  res.json({
    success: true,
    popups: [],
    totalPages: 0,
    currentPage: 1,
    total: 0
  });
});

// Upload route (mock)
app.post('/api/upload/popup-image', (req, res) => {
  console.log('✅ Upload route working!');
  res.json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl: '/uploads/test-image.jpg'
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('🚀 SERVER STARTED!');
  console.log(`📡 Running on port ${PORT}`);
  console.log('✅ Ready for testing!');
});
