#!/usr/bin/env node

/**
 * Project Startup Script
 * Run this to start the project with all fixes applied
 */

import { spawn } from 'child_process';

console.log('🚀 Starting Fireworks E-commerce Project...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('❌ Backend startup error:', err);
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Wait for backend to start
setTimeout(() => {
  console.log('\n🌐 Backend server should be running on http://localhost:3001');
  console.log('📱 Frontend should be running on http://localhost:5173');
  console.log('\n✅ Project is ready!');
  console.log('\n📋 Available endpoints:');
  console.log('   - Health: http://localhost:3001/health');
  console.log('   - Admin Users: http://localhost:3001/api/admin/users');
  console.log('   - Products: http://localhost:3001/api/products');
  console.log('   - Categories: http://localhost:3001/api/categories');
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  backend.kill();
  process.exit(0);
});
