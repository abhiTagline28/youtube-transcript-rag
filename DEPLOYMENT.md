# 🚀 Vercel Deployment Guide

This guide will help you deploy your AI-powered YouTube Transcript app to Vercel.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a cloud database at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Google AI API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com)
4. **ChromaDB**: Set up a vector database (optional - can use local instance)

## 🔧 Environment Variables Setup

### Required Environment Variables:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/youtube-transcript?retryWrites=true&w=majority

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here

# Google AI API Key (for RAG functionality)
GOOGLE_API_KEY=your-google-ai-api-key-here

# ChromaDB Configuration (optional)
CHROMA_URL=http://localhost:8000
```

## 🚀 Deployment Steps

### Step 1: Prepare Your Project

1. **Commit your changes**:

   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. **Push to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. **Login to Vercel**:

   ```bash
   vercel login
   ```

2. **Deploy your project**:

   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new one
   - Set up environment variables
   - Deploy

#### Option B: Using Vercel Dashboard

1. **Go to [vercel.com/dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure environment variables**
5. **Deploy**

### Step 3: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

| Variable         | Value                                | Environment                      |
| ---------------- | ------------------------------------ | -------------------------------- |
| `MONGODB_URI`    | Your MongoDB Atlas connection string | Production, Preview, Development |
| `JWT_SECRET`     | A strong secret key (32+ characters) | Production, Preview, Development |
| `GOOGLE_API_KEY` | Your Google AI API key               | Production, Preview, Development |
| `CHROMA_URL`     | Your ChromaDB URL (optional)         | Production, Preview, Development |

### Step 4: Set Up External Services

#### MongoDB Atlas Setup:

1. Create a cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist Vercel's IP ranges (or use 0.0.0.0/0 for all IPs)
4. Get your connection string

#### Google AI API Setup:

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create a new API key
3. Copy the key to your environment variables

#### ChromaDB Setup (Optional):

1. Use a local instance for development
2. For production, consider using a cloud ChromaDB service
3. Or deploy ChromaDB on a separate server

## 🔍 Post-Deployment Testing

After deployment, test the following:

1. **Homepage**: Verify the landing page loads
2. **Authentication**: Test signup and login
3. **Video Upload**: Test YouTube URL transcription
4. **RAG Chat**: Test AI chat functionality
5. **Video Management**: Test video list and deletion

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Failures**:

   - Check environment variables are set
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

2. **Runtime Errors**:

   - Verify MongoDB connection string
   - Check Google AI API key validity
   - Ensure ChromaDB is accessible

3. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check cookie settings for production domain

### Debug Commands:

```bash
# Check build locally
npm run build

# Test production build
npm run start

# Check Vercel logs
vercel logs
```

## 📊 Monitoring

After deployment:

1. **Monitor Vercel Analytics** for performance
2. **Check Function Logs** for errors
3. **Monitor MongoDB Atlas** for database performance
4. **Track API usage** for Google AI and ChromaDB

## 🔄 Updates and Redeployment

To update your app:

1. **Make changes locally**
2. **Test with `npm run build`**
3. **Commit and push to GitHub**
4. **Vercel will automatically redeploy**

Or manually redeploy:

```bash
vercel --prod
```

## 🎉 Success!

Your AI-powered YouTube Transcript app is now live on Vercel!

Share your deployed URL and enjoy your awesome AI-powered application! 🚀
