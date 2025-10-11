#!/usr/bin/env node

/**
 * Initialize Weight Options Database
 * 
 * This script creates default weight options in the database
 * Run this script to set up the weight options system
 */

import db from './backend/database.js';

async function initializeWeightOptions() {
  try {
    console.log('🚀 Initializing weight options database...');
    
    // Create default weight options
    const defaultOptions = db.createDefaultWeightOptions();
    
    console.log('✅ Weight options initialized successfully!');
    console.log(`📊 Created ${defaultOptions.length} default weight options:`);
    
    // Group by category and display
    const groupedOptions = defaultOptions.reduce((acc, option) => {
      if (!acc[option.category]) {
        acc[option.category] = [];
      }
      acc[option.category].push(option);
      return acc;
    }, {});
    
    Object.entries(groupedOptions).forEach(([category, options]) => {
      console.log(`\n📦 ${category.toUpperCase()} OPTIONS:`);
      options.forEach(option => {
        console.log(`  • ${option.weight} Kg - ${option.servingSize} - ₹${option.basePrice}`);
      });
    });
    
    console.log('\n🎉 Weight options database is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your backend server');
    console.log('2. Create products with weight options enabled');
    console.log('3. Test the weight selection feature');
    
  } catch (error) {
    console.error('❌ Error initializing weight options:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeWeightOptions();
