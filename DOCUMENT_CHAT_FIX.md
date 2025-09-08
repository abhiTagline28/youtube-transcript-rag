# Document Chat Fix Guide

## Problem Identified

The document chat functionality was not working because the RAG (Retrieval-Augmented Generation) processing was disabled in the upload route. This meant that while documents were being uploaded and stored in the database, they were never added to the vector store for semantic search.

## What Was Fixed

1. **Re-enabled RAG Processing**: The document upload route now properly processes documents for RAG after upload
2. **Re-enabled Document Analysis**: Document analysis using AI is now active again
3. **Added Reprocessing Endpoint**: Created a PUT endpoint to reprocess existing documents
4. **Created Reprocessing Script**: Added a script to batch reprocess all existing documents

## Setup Required

### 1. Environment Variables

Create a `.env.local` file in the project root with these variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/youtube-rag-app

# JWT Secret for authentication
JWT_SECRET=your-secret-key-change-in-production

# Google API Key for document processing and RAG
GOOGLE_API_KEY=your-google-api-key-here

# ChromaDB URL (optional, defaults to localhost:8000)
CHROMA_URL=http://localhost:8000
```

### 2. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env.local` file

### 3. Install ChromaDB (if not already installed)

```bash
# Install ChromaDB server
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

## Reprocessing Existing Documents

Since your existing documents were uploaded without RAG processing, you need to reprocess them:

### Option 1: Use the Reprocessing Script

```bash
# Make sure your environment variables are set
node reprocess-documents.js
```

### Option 2: Use the API Endpoint

For individual documents, you can use the new reprocessing endpoint:

```bash
# Replace DOCUMENT_ID with the actual document ID
curl -X PUT "http://localhost:3000/api/documents?id=DOCUMENT_ID&action=reprocess" \
  -H "Cookie: your-auth-cookie"
```

## Testing the Fix

1. **Start the application**:

   ```bash
   npm run dev
   ```

2. **Reprocess existing documents**:

   ```bash
   node reprocess-documents.js
   ```

3. **Test the chat**:
   - Go to the Documents page
   - Click on a document to open the chat
   - Ask questions like:
     - "What is RFP?"
     - "What is the full form of RFP?"
     - "What are the main features of this platform?"
     - "What is the scope of work?"

## Expected Behavior

After reprocessing, the document chat should:

- ✅ Find relevant content from your uploaded documents
- ✅ Provide accurate answers based on the document content
- ✅ Show source citations
- ✅ Handle both general and specific questions about the documents

## Troubleshooting

### If you get "Google API key not configured" errors:

- Make sure your `GOOGLE_API_KEY` is set in `.env.local`
- Restart the development server after adding the key

### If you get "ChromaDB connection" errors:

- Make sure ChromaDB is running: `chroma run --host localhost --port 8000`
- Check that the `CHROMA_URL` environment variable is correct

### If documents still don't work:

- Check the browser console for errors
- Check the server logs for processing errors
- Try re-uploading a document to test the new upload flow

## Files Modified

- `app/api/documents/upload/route.ts` - Re-enabled RAG processing
- `app/api/documents/route.ts` - Added reprocessing endpoint
- `reprocess-documents.js` - Created reprocessing script
- `DOCUMENT_CHAT_FIX.md` - This guide
