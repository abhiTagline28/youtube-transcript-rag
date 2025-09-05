# RAG (Retrieval-Augmented Generation) Setup Guide

This guide will help you set up the RAG functionality for your YouTube transcript application.

## Prerequisites

1. **Google API Key**: You'll need a Google API key for generating embeddings and running the Gemini LLM
2. **ChromaDB**: Vector database for storing embeddings
3. **Environment Variables**: Proper configuration

## Setup Steps

### 1. Install ChromaDB

```bash
# Install ChromaDB server
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

### 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/youtube-rag-app

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Google API Key (for RAG functionality)
GOOGLE_API_KEY=your-google-api-key-here

# ChromaDB URL (for vector storage)
CHROMA_URL=http://localhost:8000

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

### 3. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to your `.env.local` file as `GOOGLE_API_KEY`

### 4. Start the Application

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## RAG Features

### 1. **Automatic Embedding Generation**

- When you transcribe a video, the transcript is automatically processed for RAG
- Text is split into chunks and converted to embeddings
- Embeddings are stored in ChromaDB with user-specific metadata

### 2. **Chat Interface**

- **General Chat**: Ask questions across all your videos (`/chat`)
- **Video-Specific Chat**: Ask questions about a specific video (Chat button on video cards)

### 3. **Intelligent Question Answering**

- Uses semantic search to find relevant transcript chunks
- Provides context-aware answers based on your video content
- Shows source citations for transparency

## Usage Examples

### General Questions

- "What are the main topics discussed in my videos?"
- "Summarize the key points from my recent uploads"
- "What programming concepts are covered?"
- "Find videos about machine learning"

### Video-Specific Questions

- "What did this video say about React hooks?"
- "Summarize the main points of this video"
- "What examples were given in this tutorial?"

## API Endpoints

### Chat API (`/api/chat`)

```typescript
POST /api/chat
{
  "question": "Your question here",
  "videoId": "optional-specific-video-id",
  "maxResults": 4
}
```

### Response Format

```typescript
{
  "answer": "AI-generated answer based on your videos",
  "sources": [
    {
      "videoId": "video-id",
      "videoTitle": "Video Title",
      "content": "Relevant transcript chunk"
    }
  ],
  "hasAnswer": true
}
```

## Architecture

### Components

1. **Vector Store Service** (`lib/vectorStore.ts`)

   - Manages ChromaDB operations
   - Handles document chunking and embedding storage
   - Provides similarity search functionality

2. **RAG Service** (`lib/ragService.ts`)

   - Orchestrates the RAG pipeline
   - Handles question processing and answer generation
   - Manages context preparation for LLM

3. **Chat Interface** (`components/ChatInterface.tsx`)
   - Reusable chat component
   - Supports both general and video-specific conversations
   - Displays sources and handles loading states

### Data Flow

1. **Video Transcription** → **Text Chunking** → **Embedding Generation** → **Vector Storage**
2. **User Question** → **Semantic Search** → **Context Retrieval** → **LLM Processing** → **Answer Generation**

## Troubleshooting

### Common Issues

1. **ChromaDB Connection Error**

   - Ensure ChromaDB server is running on `http://localhost:8000`
   - Check if the port is available

2. **Google API Errors**

   - Verify your API key is correct
   - Check your Google AI Studio account has sufficient quota
   - Ensure the API key has the necessary permissions

3. **No Results Found**
   - Make sure you have transcribed videos in your library
   - Check if the vector store has been populated
   - Try re-transcribing a video to regenerate embeddings

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

## Performance Considerations

- **Chunk Size**: Currently set to 1000 characters with 200 character overlap
- **Max Results**: Default is 4 relevant chunks per query
- **Model**: Uses Gemini 1.5 Flash for cost efficiency and performance
- **Caching**: Consider implementing response caching for frequently asked questions

## Security

- All vector operations are user-scoped
- Users can only access their own video embeddings
- API endpoints require authentication
- Vector store includes user metadata for filtering

## Future Enhancements

- [ ] Support for multiple languages
- [ ] Advanced filtering options
- [ ] Conversation history
- [ ] Export chat conversations
- [ ] Batch processing for existing videos
- [ ] Custom embedding models
- [ ] Advanced search operators
