import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { searchSimilarDocuments } from "./vectorStore";

// Initialize the LLM
const llm = process.env.GOOGLE_API_KEY ? new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
  temperature: 0.7,
}) : null;

// Create a prompt template for document RAG
const DOCUMENT_RAG_PROMPT = PromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on uploaded documents (PDF, DOC, DOCX). 
Use the following context from documents to answer the user's question.

Context from documents:
{context}

Question: {question}

Instructions:
1. Answer the question based ONLY on the provided context from the documents
2. If the context doesn't contain enough information to answer the question, say "I don't have enough information in the uploaded documents to answer this question."
3. Be specific and cite relevant parts of the document when possible
4. If the question is about multiple documents, make sure to distinguish between them
5. Keep your answer concise but informative
6. If you reference specific information, mention which document it came from

Answer:`);

export interface DocumentRAGResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    fileName: string;
    content: string;
    score?: number;
  }>;
  hasAnswer: boolean;
}

export async function askQuestionAboutDocuments(
  question: string,
  userId: string,
  maxResults: number = 4
): Promise<DocumentRAGResponse> {
  try {
    // Search for relevant documents
    let relevantDocs: any[] = [];
    try {
      relevantDocs = await searchSimilarDocuments(question, userId, maxResults);
    } catch (vectorError) {
      console.log("Vector store not available:", vectorError);
      return {
        answer: "Document search is not available. Please configure your Google API key to enable document search functionality.",
        sources: [],
        hasAnswer: false,
      };
    }
    
    if (relevantDocs.length === 0) {
      return {
        answer: "I don't have any documents in your library to answer this question. Please upload some PDF or DOC files first.",
        sources: [],
        hasAnswer: false,
      };
    }

    // Filter for document-type results only
    const documentDocs = relevantDocs.filter(
      (doc) => doc.metadata?.type === "document"
    );

    if (documentDocs.length === 0) {
      return {
        answer: "I don't have any documents in your library to answer this question. Please upload some PDF or DOC files first.",
        sources: [],
        hasAnswer: false,
      };
    }

    // Prepare context from relevant documents
    const context = documentDocs
      .map((doc, index) => {
        const fileName = doc.metadata?.fileName || "Unknown Document";
        const documentId = doc.metadata?.documentId || "unknown";
        return `[Source ${index + 1} - ${fileName} (ID: ${documentId})]\n${doc.pageContent}`;
      })
      .join("\n\n");

    // Generate answer using LLM
    if (!llm) {
      return {
        answer: "AI processing is not available. Please configure your Google API key to enable document chat functionality.",
        sources: documentDocs.map((doc) => ({
          documentId: doc.metadata?.documentId || "unknown",
          fileName: doc.metadata?.fileName || "Unknown Document",
          content: doc.pageContent,
        })),
        hasAnswer: false,
      };
    }

    const prompt = await DOCUMENT_RAG_PROMPT.format({
      context,
      question,
    });

    const response = await llm.invoke(prompt);
    const answer = response.content as string;

    // Prepare sources
    const sources = documentDocs.map((doc) => ({
      documentId: doc.metadata?.documentId || "unknown",
      fileName: doc.metadata?.fileName || "Unknown Document",
      content: doc.pageContent,
    }));

    return {
      answer,
      sources,
      hasAnswer: true,
    };
  } catch (error) {
    console.error("Error in document RAG service:", error);
    throw new Error("Failed to process your question. Please try again.");
  }
}

export async function askQuestionAboutSpecificDocument(
  question: string,
  documentId: string,
  userId: string,
  maxResults: number = 3
): Promise<DocumentRAGResponse> {
  try {
    // Search for relevant documents
    let relevantDocs: any[] = [];
    try {
      relevantDocs = await searchSimilarDocuments(question, userId, maxResults);
    } catch (vectorError) {
      console.log("Vector store not available:", vectorError);
      return {
        answer: "Document search is not available. Please configure your Google API key to enable document search functionality.",
        sources: [],
        hasAnswer: false,
      };
    }
    
    // Filter documents by specific document ID
    const documentSpecificDocs = relevantDocs.filter(
      (doc) => doc.metadata?.documentId === documentId && doc.metadata?.type === "document"
    );
    
    if (documentSpecificDocs.length === 0) {
      return {
        answer: "I don't have enough information about this specific document to answer your question.",
        sources: [],
        hasAnswer: false,
      };
    }

    // Prepare context from relevant documents
    const context = documentSpecificDocs
      .map((doc, index) => {
        const fileName = doc.metadata?.fileName || "Unknown Document";
        return `[Source ${index + 1} - ${fileName}]\n${doc.pageContent}`;
      })
      .join("\n\n");

    // Generate answer using LLM
    if (!llm) {
      return {
        answer: "AI processing is not available. Please configure your Google API key to enable document chat functionality.",
        sources: documentSpecificDocs.map((doc) => ({
          documentId: doc.metadata?.documentId || "unknown",
          fileName: doc.metadata?.fileName || "Unknown Document",
          content: doc.pageContent,
        })),
        hasAnswer: false,
      };
    }

    const prompt = await DOCUMENT_RAG_PROMPT.format({
      context,
      question,
    });

    const response = await llm.invoke(prompt);
    const answer = response.content as string;

    // Prepare sources
    const sources = documentSpecificDocs.map((doc) => ({
      documentId: doc.metadata?.documentId || "unknown",
      fileName: doc.metadata?.fileName || "Unknown Document",
      content: doc.pageContent,
    }));

    return {
      answer,
      sources,
      hasAnswer: true,
    };
  } catch (error) {
    console.error("Error in document RAG service for specific document:", error);
    throw new Error("Failed to process your question about this document. Please try again.");
  }
}

