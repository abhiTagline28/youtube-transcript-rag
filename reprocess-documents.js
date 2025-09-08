#!/usr/bin/env node

/**
 * Script to reprocess existing documents for RAG
 * This will add existing documents to the vector store so they can be searched
 */

const { MongoClient } = require("mongodb");
const { processDocumentForRAG } = require("./lib/vectorStore");

// Configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/youtube-rag-app";

async function reprocessDocuments() {
  let client;

  try {
    console.log("Connecting to MongoDB...");
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db();
    const documents = db.collection("documents");

    console.log("Fetching all documents...");
    const allDocs = await documents.find({}).toArray();

    console.log(`Found ${allDocs.length} documents to reprocess`);

    for (const doc of allDocs) {
      try {
        console.log(
          `\nReprocessing document: ${doc.originalName} (ID: ${doc._id})`
        );

        await processDocumentForRAG(
          doc.extractedText,
          doc._id.toString(),
          doc.originalName,
          doc.userId
        );

        console.log(`✅ Successfully reprocessed: ${doc.originalName}`);
      } catch (error) {
        console.error(
          `❌ Failed to reprocess ${doc.originalName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Document reprocessing completed!");
    console.log(
      "You can now ask questions about your documents in the chat interface."
    );
  } catch (error) {
    console.error("Error during reprocessing:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the script
if (require.main === module) {
  reprocessDocuments().catch(console.error);
}

module.exports = { reprocessDocuments };
