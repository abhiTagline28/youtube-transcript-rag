// Debug script to test vector store functionality
// Run with: node debug-vector-store.js

import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

async function debugVectorStore() {
  try {
    console.log("🔍 Starting vector store debug...");

    // Initialize embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      model: "models/embedding-001",
    });

    console.log("✅ Embeddings initialized");

    // Try to connect to existing collection
    let store;
    try {
      store = await Chroma.fromExistingCollection(embeddings, {
        collectionName: "youtube-transcripts",
        url: process.env.CHROMA_URL || "http://localhost:8000",
      });
      console.log("✅ Connected to existing collection");
    } catch (error) {
      console.log("❌ Collection doesn't exist, creating new one...");
      store = await Chroma.fromDocuments([], embeddings, {
        collectionName: "youtube-transcripts",
        url: process.env.CHROMA_URL || "http://localhost:8000",
      });
      console.log("✅ Created new collection");
    }

    // Test search
    console.log("🔍 Testing search functionality...");
    const results = await store.similaritySearch("test query", 5);
    console.log(`Found ${results.length} results`);

    if (results.length > 0) {
      console.log("Sample result metadata:", results[0].metadata);
    }

    console.log("✅ Vector store debug completed successfully");
  } catch (error) {
    console.error("❌ Error during vector store debug:", error);
  }
}

// Run the debug function
debugVectorStore();
