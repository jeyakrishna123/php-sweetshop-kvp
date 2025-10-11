#!/bin/bash
echo "🚀 Building for Netlify deployment..."

# Install dependencies
npm install

# Build the application
npm run build

echo "✅ Build complete! Ready for Netlify deployment."
