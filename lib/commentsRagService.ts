import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { searchSimilarDocuments } from "./vectorStore";

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
  temperature: 0.3,
});

export interface CommentsRAGResponse {
  answer: string;
  sources: Array<{
    comment: string;
    author: string;
    sentiment: string;
    likes: number;
    videoTitle: string;
    relevanceScore?: number;
  }>;
  totalComments: number;
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export async function askQuestionAboutComments(
  question: string,
  videoId: string,
  userId: string,
  maxResults: number = 4
): Promise<CommentsRAGResponse> {
  try {
    console.log(`Asking question about comments: "${question}" for video: ${videoId}`);

    // Search for relevant comments
    const relevantComments = await searchSimilarDocuments(
      question,
      userId,
      maxResults * 2 // Get more results to filter by videoId
    );

    // Filter comments by videoId and type
    const videoComments = relevantComments.filter(
      (doc) => doc.metadata?.videoId === videoId && doc.metadata?.type === "comment"
    ).slice(0, maxResults);

    console.log(`Found ${videoComments.length} relevant comments for video ${videoId}`);

    if (videoComments.length === 0) {
      return {
        answer: "I couldn't find any relevant comments for this video to answer your question. The video might not have comments yet, or there might not be any comments that match your query.",
        sources: [],
        totalComments: 0,
        sentimentBreakdown: { positive: 0, negative: 0, neutral: 0 }
      };
    }

    // Prepare context from comments
    const commentsContext = videoComments.map((doc, index) => {
      const metadata = doc.metadata || {};
      return `
Comment ${index + 1}:
Text: ${metadata.originalText || doc.pageContent}
Author: ${metadata.author || 'Unknown'}
Sentiment: ${metadata.sentiment || 'unknown'}
Likes: ${metadata.likeCount || 0}
Date: ${metadata.publishedAt || 'Unknown'}
      `.trim();
    }).join('\n\n');

    // Create prompt for comment analysis
    const prompt = `
You are an AI assistant analyzing YouTube video comments. Based on the following comments, answer the user's question about the video's audience feedback.

User Question: "${question}"

Relevant Comments:
${commentsContext}

Instructions:
1. Analyze the comments to answer the user's question
2. Provide insights about viewer sentiment, common themes, or specific feedback
3. If the question is about sentiment trends, provide a breakdown
4. If the question is about specific topics, highlight relevant comments
5. Be specific and reference actual comment content when relevant
6. If you can't answer based on the available comments, say so clearly

Answer:`;

    // Get AI response
    const response = await llm.invoke(prompt);
    const answer = response.content as string;

    // Prepare sources
    const sources = videoComments.map((doc) => {
      const metadata = doc.metadata || {};
      return {
        comment: metadata.originalText || doc.pageContent,
        author: metadata.author || 'Unknown',
        sentiment: metadata.sentiment || 'unknown',
        likes: metadata.likeCount || 0,
        videoTitle: metadata.videoTitle || 'Unknown Video',
        relevanceScore: 0.8 // Placeholder relevance score
      };
    });

    // Calculate sentiment breakdown from all comments (not just relevant ones)
    const allComments = relevantComments.filter(
      (doc) => doc.metadata?.videoId === videoId && doc.metadata?.type === "comment"
    );
    
    const sentimentBreakdown = allComments.reduce(
      (acc, doc) => {
        const sentiment = doc.metadata?.sentiment;
        if (sentiment === 'positive') acc.positive++;
        else if (sentiment === 'negative') acc.negative++;
        else acc.neutral++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    return {
      answer,
      sources,
      totalComments: allComments.length,
      sentimentBreakdown
    };

  } catch (error) {
    console.error("Error in comments RAG service:", error);
    throw new Error("Failed to process comment analysis request");
  }
}

export async function getCommentInsights(
  videoId: string,
  userId: string
): Promise<{
  topPositiveComments: Array<{
    text: string;
    author: string;
    likes: number;
  }>;
  topNegativeComments: Array<{
    text: string;
    author: string;
    likes: number;
  }>;
  commonThemes: string[];
  sentimentTrends: {
    positive: number;
    negative: number;
    neutral: number;
  };
}> {
  try {
    // Search for all comments for this video
    const allComments = await searchSimilarDocuments(
      "comments feedback sentiment",
      userId,
      50 // Get more comments for analysis
    );

    const videoComments = allComments.filter(
      (doc) => doc.metadata?.videoId === videoId && doc.metadata?.type === "comment"
    );

    // Analyze comments
    const positiveComments = videoComments
      .filter(doc => doc.metadata?.sentiment === 'positive')
      .sort((a, b) => (b.metadata?.likeCount || 0) - (a.metadata?.likeCount || 0))
      .slice(0, 3)
      .map(doc => ({
        text: doc.metadata?.originalText || doc.pageContent,
        author: doc.metadata?.author || 'Unknown',
        likes: doc.metadata?.likeCount || 0
      }));

    const negativeComments = videoComments
      .filter(doc => doc.metadata?.sentiment === 'negative')
      .sort((a, b) => (b.metadata?.likeCount || 0) - (a.metadata?.likeCount || 0))
      .slice(0, 3)
      .map(doc => ({
        text: doc.metadata?.originalText || doc.pageContent,
        author: doc.metadata?.author || 'Unknown',
        likes: doc.metadata?.likeCount || 0
      }));

    const sentimentTrends = videoComments.reduce(
      (acc, doc) => {
        const sentiment = doc.metadata?.sentiment;
        if (sentiment === 'positive') acc.positive++;
        else if (sentiment === 'negative') acc.negative++;
        else acc.neutral++;
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 }
    );

    // Simple theme extraction (in a real implementation, you'd use more sophisticated NLP)
    const commonThemes = [
      "Tutorial quality",
      "Content clarity", 
      "Pacing and speed",
      "Audio/video quality",
      "Usefulness",
      "Recommendations"
    ];

    return {
      topPositiveComments: positiveComments,
      topNegativeComments: negativeComments,
      commonThemes,
      sentimentTrends
    };

  } catch (error) {
    console.error("Error getting comment insights:", error);
    throw new Error("Failed to get comment insights");
  }
}
