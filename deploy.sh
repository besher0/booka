#!/bin/bash

echo "🚀 Preparing Booka Backend for Vercel Deployment..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project
echo "📦 Building the project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📋 Don't forget to:"
echo "   1. Set up your environment variables in Vercel dashboard"
echo "   2. Configure your PostgreSQL database"
echo "   3. Test your API endpoints"
echo ""
echo "📖 Check VERCEL_DEPLOYMENT.md for detailed instructions"