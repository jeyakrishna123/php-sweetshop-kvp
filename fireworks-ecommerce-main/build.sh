#!/bin/bash
echo "🚀 Starting build process..."

# Navigate to frontend directory
cd ecommerce-website/ecommerce-frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"
