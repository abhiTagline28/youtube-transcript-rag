import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

// Initialize embeddings
const embeddings = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "models/embedding-001",
}) : null;

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Vector store instance
let vectorStore: Chroma | null = null;

export async function getVectorStore(): Promise<Chroma> {
  if (!embeddings) {
    throw new Error("Google API key not configured. Please set GOOGLE_API_KEY environment variable.");
  }
  
  if (!vectorStore) {
    try {
      console.log("Connecting to ChromaDB...");
      // Try to connect to existing collection
      vectorStore = await Chroma.fromExistingCollection(embeddings, {
        collectionName: "youtube-transcripts",
        url: process.env.CHROMA_URL || "http://localhost:8000",
      });
      console.log("Connected to existing ChromaDB collection");
    } catch (error) {
      console.log("Collection doesn't exist, creating new one...", error);
      try {
        // If collection doesn't exist, create a new one
        vectorStore = await Chroma.fromDocuments([], embeddings, {
          collectionName: "youtube-transcripts",
          url: process.env.CHROMA_URL || "http://localhost:8000",
        });
        console.log("Created new ChromaDB collection");
      } catch (createError) {
        console.error("Failed to create ChromaDB collection:", createError);
        throw createError;
      }
    }
  }
  return vectorStore;
}

export async function createVectorStore(): Promise<Chroma> {
  if (!embeddings) {
    throw new Error("Google API key not configured. Please set GOOGLE_API_KEY environment variable.");
  }
  
  vectorStore = await Chroma.fromDocuments([], embeddings, {
    collectionName: "youtube-transcripts",
    url: process.env.CHROMA_URL || "http://localhost:8000",
  });
  return vectorStore;
}

export async function addDocumentsToVectorStore(
  documents: Document[],
  userId: string
): Promise<void> {
  const store = await getVectorStore();

  // Add metadata to each document
  const documentsWithMetadata = documents.map((doc) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      userId,
      timestamp: new Date().toISOString(),
    },
  }));

  console.log(`Adding ${documentsWithMetadata.length} documents to vector store for user ${userId}`);
  console.log("Sample metadata:", documentsWithMetadata[0]?.metadata);

  await store.addDocuments(documentsWithMetadata);
  console.log("Successfully added documents to vector store");
}

export async function searchSimilarDocuments(
  query: string,
  userId: string,
  k: number = 4
): Promise<Document[]> {
  const store = await getVectorStore();

  console.log(`Searching for query: "${query}" for user: ${userId}`);

  // Search without filter first, then filter by userId
  const results = await store.similaritySearch(query, k * 2); // Get more results to filter

  console.log(`Found ${results.length} total results before filtering`);

  // Filter results by userId
  const filteredResults = results.filter((doc) => 
    doc.metadata?.userId === userId
  ).slice(0, k); // Take only the requested number

  console.log(`Found ${filteredResults.length} results after filtering for user ${userId}`);
  console.log("Sample filtered result metadata:", filteredResults[0]?.metadata);

  return filteredResults;
}

export async function processTranscriptForRAG(
  transcript: string,
  videoId: string,
  videoTitle: string,
  userId: string
): Promise<void> {
  try {
    // Split transcript into chunks
    const docs = await textSplitter.createDocuments(
      [transcript],
      [
        {
          videoId,
          videoTitle,
          userId,
          type: "transcript",
        },
      ]
    );

    // Add to vector store
    await addDocumentsToVectorStore(docs, userId);

    console.log(
      `Successfully processed transcript for video ${videoId} with ${docs.length} chunks`
    );
  } catch (error) {
    console.error("Error processing transcript for RAG:", error);
    throw error;
  }
}

export async function processDocumentForRAG(
  extractedText: string,
  documentId: string,
  fileName: string,
  userId: string
): Promise<void> {
  try {
    console.log(`Starting RAG processing for document: ${fileName}`);
    
    // Split document into chunks
    console.log("Splitting document into chunks...");
    const docs = await textSplitter.createDocuments(
      [extractedText],
      [
        {
          documentId,
          fileName,
          userId,
          type: "document",
        },
      ]
    );

    console.log(`Document split into ${docs.length} chunks`);

    // Add to vector store
    console.log("Adding documents to vector store...");
    await addDocumentsToVectorStore(docs, userId);

    console.log(
      `Successfully processed document ${fileName} with ${docs.length} chunks`
    );
  } catch (error) {
    console.error("Error processing document for RAG:", error);
    console.error("RAG error details:", {
      documentId,
      fileName,
      userId,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

export async function processCommentsForRAG(
  comments: Array<{
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    author: string;
    likeCount: number;
    publishedAt: Date;
  }>,
  videoId: string,
  videoTitle: string,
  userId: string
): Promise<void> {
  try {
    if (!comments || comments.length === 0) {
      console.log("No comments to process for RAG");
      return;
    }

    // Create documents for each comment
    const commentDocs = comments.map(comment => {
      // Create a rich text representation of the comment for better search
      const commentContent = `
Comment: ${comment.text}
Author: ${comment.author}
Sentiment: ${comment.sentiment}
Likes: ${comment.likeCount}
Date: ${comment.publishedAt.toISOString()}
Video: ${videoTitle}
      `.trim();

      return new Document({
        pageContent: commentContent,
        metadata: {
          videoId: videoId,
          videoTitle: videoTitle,
          userId: userId,
          type: "comment",
          sentiment: comment.sentiment,
          author: comment.author,
          likeCount: comment.likeCount,
          publishedAt: comment.publishedAt.toISOString(),
          originalText: comment.text,
        },
      });
    });

    // Add comment documents to vector store
    await addDocumentsToVectorStore(commentDocs, userId);
    console.log(`Successfully processed ${commentDocs.length} comments for RAG`);
  } catch (error) {
    console.error("Error processing comments for RAG:", error);
    throw error;
  }
}

export async function deleteVideoFromVectorStore(
  videoId: string,
  _userId: string // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<void> {
  try {
    // Note: Chroma doesn't have a direct delete by metadata method
    // We'll need to implement a workaround or use a different approach
    // For now, we'll log this as a limitation
    console.log(
      `Note: Vector store cleanup for video ${videoId} not implemented yet`
    );

    // TODO: Implement proper deletion from vector store
    // This might require storing document IDs in MongoDB for proper cleanup
  } catch (error) {
    console.error("Error deleting video from vector store:", error);
    throw error;
  }
}
