# Environment Setup

To fix the document upload issue, you need to create a `.env.local` file in the root directory with the following environment variables:

## Required Environment Variables

Create a file named `.env.local` in the project root with the following content:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/youtube-rag-app

# JWT Secret for authentication
JWT_SECRET=your-secret-key-change-in-production

# Google API Key for document processing and RAG
GOOGLE_API_KEY=your-google-api-key-here

# Pinecone (managed vector DB)
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=your-pinecone-index-name
# Optional: keep per-user isolation or default namespace
PINECONE_NAMESPACE=youtube-transcripts

# Vercel Blob (for file storage)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token

# YouTube API Key (optional, for YouTube features)
YOUTUBE_API_KEY=your-youtube-api-key-here
```

## Getting API Keys

### Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Generative AI API
4. Create credentials (API Key)
5. Copy the API key and replace `your-google-api-key-here` in the .env.local file

### MongoDB

- For local development, make sure MongoDB is running on your machine
- For production, use MongoDB Atlas or another MongoDB service

## After Setup

1. Restart your development server: `npm run dev`
2. Try uploading a document again

The upload should now work properly with proper error handling and fallbacks for missing API keys. For production, use Pinecone instead of local Chroma; set the Pinecone variables above in Vercel.
