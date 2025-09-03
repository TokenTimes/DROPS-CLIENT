#!/bin/bash

echo "🚀 Building DROPS Next.js Client for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build for production
echo "🔨 Building Next.js for production..."
npm run build

echo "✅ Next.js build completed! Output in .next/ directory"
ls -la .next/
