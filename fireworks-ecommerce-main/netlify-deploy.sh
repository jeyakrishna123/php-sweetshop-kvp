#!/bin/bash
# Netlify deployment script
echo "🚀 Starting Netlify deployment..."

# Install Netlify CLI if not already installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the frontend
echo "🔨 Building frontend..."
cd ecommerce-website/ecommerce-frontend
npm ci
npm run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
cd ../..
netlify deploy --prod --dir=ecommerce-website/ecommerce-frontend/dist --functions=netlify/functions

echo "✅ Deployment complete!"
