import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

// Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "models/embedding-001",
});

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Vector store instance
let vectorStore: Chroma | null = null;

export async function getVectorStore(): Promise<Chroma> {
  if (!vectorStore) {
    vectorStore = await Chroma.fromExistingCollection(embeddings, {
      collectionName: "youtube-transcripts",
      url: process.env.CHROMA_URL || "http://localhost:8000",
    });
  }
  return vectorStore;
}

export async function createVectorStore(): Promise<Chroma> {
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

  await store.addDocuments(documentsWithMetadata);
}

export async function searchSimilarDocuments(
  query: string,
  userId: string,
  k: number = 4
): Promise<Document[]> {
  const store = await getVectorStore();

  // Search with user filter
  const results = await store.similaritySearch(query, k, {
    userId,
  });

  return results;
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
