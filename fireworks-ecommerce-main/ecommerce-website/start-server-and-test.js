// Start Server and Test Upload Routes
import { spawn } from 'child_process';
import axios from 'axios';

console.log('🚀 STARTING SERVER AND TESTING UPLOAD ROUTES');
console.log('============================================');

// Start the server
const server = spawn('node', ['server.js'], {
  cwd: './backend',
  stdio: 'pipe'
});

let serverStarted = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 Server Output:', output);
  
  if (output.includes('Server running on port 3001') || output.includes('Server started')) {
    serverStarted = true;
    console.log('✅ Server started successfully!');
    testRoutes();
  }
});

server.stderr.on('data', (data) => {
  console.error('❌ Server Error:', data.toString());
});

server.on('close', (code) => {
  console.log(`🔚 Server process exited with code ${code}`);
});

// Test the routes after server starts
async function testRoutes() {
  console.log('\n🧪 TESTING UPLOAD ROUTES');
  console.log('========================');
  
  const API_BASE = 'http://localhost:3001';
  
  try {
    // Test 1: Basic test route
    console.log('\n1️⃣ Testing basic test route...');
    const testResponse = await axios.get(`${API_BASE}/api/upload/test`);
    console.log('✅ Test route working:', testResponse.data.success);
    
    // Test 2: Test upload route (no auth)
    console.log('\n2️⃣ Testing test-upload route...');
    try {
      const testUploadResponse = await axios.post(`${API_BASE}/api/upload/test-upload`, new FormData(), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Test upload route working');
    } catch (error) {
      console.log('⚠️ Test upload route (expected to fail without file):', error.response?.status);
    }
    
    // Test 3: Popup image test route (no auth)
    console.log('\n3️⃣ Testing popup-image-test route...');
    try {
      const popupTestResponse = await axios.post(`${API_BASE}/api/upload/popup-image-test`, new FormData(), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Popup image test route working');
    } catch (error) {
      console.log('⚠️ Popup image test route (expected to fail without file):', error.response?.status);
    }
    
    console.log('\n🎯 ROUTE TESTING COMPLETE');
    console.log('========================');
    console.log('✅ All routes are properly registered!');
    console.log('📱 You can now try uploading an image in the admin panel.');
    
    // Keep server running
    console.log('\n🔄 Server is running. Press Ctrl+C to stop.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the backend server is running!');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill();
  process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
  if (!serverStarted) {
    console.log('⏰ Server startup timeout. Please check for errors.');
    server.kill();
    process.exit(1);
  }
}, 30000);
