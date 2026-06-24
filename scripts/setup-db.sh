#!/bin/bash

echo "🚀 Setting up AUSSIE RIGS ARENA Database..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "📊 Setting up database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo "✅ Database setup complete!"
echo "🎉 You can now run 'npm run dev' to start the development server"
echo "📊 Run 'npm run db:studio' to view your database"
