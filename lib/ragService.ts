import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { searchSimilarDocuments } from "./vectorStore";

// Initialize the LLM
const llm = process.env.GOOGLE_API_KEY ? new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
  temperature: 0.7,
}) : null;

// Create a prompt template for RAG
const RAG_PROMPT = PromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on YouTube video transcripts. 
Use the following context from video transcripts to answer the user's question.

Context from video transcripts:
{context}

Question: {question}

Instructions:
1. Answer the question based ONLY on the provided context from the video transcripts
2. If the context doesn't contain enough information to answer the question, say "I don't have enough information in the video transcripts to answer this question."
3. Be specific and cite relevant parts of the transcript when possible
4. If the question is about multiple videos, make sure to distinguish between them
5. Keep your answer concise but informative

Answer:`);

export interface RAGResponse {
  answer: string;
  sources: Array<{
    videoId: string;
    videoTitle: string;
    content: string;
    score?: number;
  }>;
  hasAnswer: boolean;
}

export async function askQuestion(
  question: string,
  userId: string,
  maxResults: number = 4
): Promise<RAGResponse> {
  try {
    // Search for relevant documents
    const relevantDocs = await searchSimilarDocuments(question, userId, maxResults);
    
    if (relevantDocs.length === 0) {
      return {
        answer: "I don't have any video transcripts in your library to answer this question. Please upload and transcribe some videos first.",
        sources: [],
        hasAnswer: false,
      };
    }

    // Prepare context from relevant documents
    const context = relevantDocs
      .map((doc, index) => {
        const videoTitle = doc.metadata?.videoTitle || "Unknown Video";
        const videoId = doc.metadata?.videoId || "unknown";
        return `[Source ${index + 1} - ${videoTitle} (ID: ${videoId})]\n${doc.pageContent}`;
      })
      .join("\n\n");

    // Generate answer using LLM
    const prompt = await RAG_PROMPT.format({
      context,
      question,
    });

    const response = await llm.invoke(prompt);
    const answer = response.content as string;

    // Prepare sources
    const sources = relevantDocs.map((doc) => ({
      videoId: doc.metadata?.videoId || "unknown",
      videoTitle: doc.metadata?.videoTitle || "Unknown Video",
      content: doc.pageContent,
    }));

    return {
      answer,
      sources,
      hasAnswer: true,
    };
  } catch (error) {
    console.error("Error in RAG service:", error);
    throw new Error("Failed to process your question. Please try again.");
  }
}

export async function askQuestionAboutSpecificVideo(
  question: string,
  videoId: string,
  userId: string,
  maxResults: number = 3
): Promise<RAGResponse> {
  try {
    // Search for relevant documents with video ID filter
    const relevantDocs = await searchSimilarDocuments(question, userId, maxResults);
    
    // Filter documents by specific video ID
    const videoSpecificDocs = relevantDocs.filter(
      (doc) => doc.metadata?.videoId === videoId
    );
    
    if (videoSpecificDocs.length === 0) {
      return {
        answer: "I don't have enough information about this specific video to answer your question.",
        sources: [],
        hasAnswer: false,
      };
    }

    // Prepare context from relevant documents
    const context = videoSpecificDocs
      .map((doc, index) => {
        const videoTitle = doc.metadata?.videoTitle || "Unknown Video";
        return `[Source ${index + 1} - ${videoTitle}]\n${doc.pageContent}`;
      })
      .join("\n\n");

    // Generate answer using LLM
    const prompt = await RAG_PROMPT.format({
      context,
      question,
    });

    const response = await llm.invoke(prompt);
    const answer = response.content as string;

    // Prepare sources
    const sources = videoSpecificDocs.map((doc) => ({
      videoId: doc.metadata?.videoId || "unknown",
      videoTitle: doc.metadata?.videoTitle || "Unknown Video",
      content: doc.pageContent,
    }));

    return {
      answer,
      sources,
      hasAnswer: true,
    };
  } catch (error) {
    console.error("Error in RAG service for specific video:", error);
    throw new Error("Failed to process your question about this video. Please try again.");
  }
}
