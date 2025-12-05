/**
 * Test MongoDB Connection
 * This script tests if we can connect to MongoDB and lists collections
 */

import mongoose from 'mongoose';

// MongoDB Connection String
// Your actual database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fireworkshub';

console.log('🔍 Testing MongoDB Connection...\n');
console.log(`📡 Connecting to: ${MONGODB_URI}\n`);

try {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Successfully connected to MongoDB!\n');

  // Get database
  const db = mongoose.connection.db;

  // List all collections
  const collections = await db.listCollections().toArray();
  console.log(`📊 Found ${collections.length} collections:\n`);

  // Show collection names and document counts
  for (const collection of collections) {
    const count = await db.collection(collection.name).countDocuments();
    console.log(`   📁 ${collection.name}: ${count} documents`);
  }

  console.log('\n✅ MongoDB is ready for migration!');
  console.log('\n📝 Next step: Run migration script');
  console.log('   npm run migrate\n');

} catch (error) {
  console.error('❌ Error connecting to MongoDB:');
  console.error(error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Make sure MongoDB is running');
  console.log('   2. Check the connection string in the script');
  console.log('   3. Verify database name is correct\n');
} finally {
  await mongoose.connection.close();
}
