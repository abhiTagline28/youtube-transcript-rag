import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

// Initialize the LLM
const llm = process.env.GOOGLE_API_KEY ? new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
  temperature: 0.3,
}) : null;

// Prompt for sentiment analysis
const SENTIMENT_PROMPT = PromptTemplate.fromTemplate(`
Analyze the sentiment of the following YouTube comment and classify it as positive, negative, or neutral.

Comment: "{comment}"

Instructions:
1. Consider the overall tone and emotion of the comment
2. Look for positive words (good, great, amazing, love, etc.)
3. Look for negative words (bad, terrible, hate, worst, etc.)
4. Consider context and sarcasm
5. Return only one word: "positive", "negative", or "neutral"

Sentiment:`);

export interface YouTubeComment {
  text: string;
  author: string;
  likeCount: number;
  publishedAt: Date;
}

export interface AnalyzedComment {
  text: string;
  author: string;
  likeCount: number;
  publishedAt: Date;
  sentiment: 'positive' | 'negative' | 'neutral';
}

// Function to fetch YouTube comments - tries real API first, falls back to mock
export async function fetchYouTubeComments(videoId: string): Promise<YouTubeComment[]> {
  console.log(`Fetching comments for video: ${videoId}`);
  
  // Try to fetch real comments if API key is available
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (apiKey) {
    try {
      console.log('Attempting to fetch real YouTube comments...');
      const { fetchRealYouTubeComments } = await import('./realYouTubeCommentsService');
      const realComments = await fetchRealYouTubeComments(videoId, apiKey);
      
      // Convert real comments to our format
      const convertedComments: YouTubeComment[] = realComments.map(comment => ({
        text: comment.text,
        author: comment.author,
        likeCount: comment.likeCount,
        publishedAt: comment.publishedAt
      }));
      
      console.log(`Successfully fetched ${convertedComments.length} real comments`);
      return convertedComments;
      
    } catch (error) {
      console.error('Failed to fetch real comments, falling back to mock:', error);
    }
  } else {
    console.log('No YouTube API key found, using mock comments');
  }
  
  // Fallback to mock comments
  const mockComments: YouTubeComment[] = [
    {
      text: "Great tutorial! Very helpful and easy to follow. Thanks for sharing!",
      author: "John Doe",
      likeCount: 15,
      publishedAt: new Date("2024-01-15"),
    },
    {
      text: "This is exactly what I was looking for. Clear explanations and good examples.",
      author: "Jane Smith",
      likeCount: 8,
      publishedAt: new Date("2024-01-16"),
    },
    {
      text: "Waste of time. The instructor goes too fast and doesn't explain the basics properly.",
      author: "Anonymous",
      likeCount: 2,
      publishedAt: new Date("2024-01-17"),
    },
    {
      text: "Amazing content! I learned so much from this video. Highly recommended!",
      author: "TechEnthusiast",
      likeCount: 23,
      publishedAt: new Date("2024-01-18"),
    },
    {
      text: "Could be better. Some parts were confusing and the audio quality was poor.",
      author: "Viewer123",
      likeCount: 1,
      publishedAt: new Date("2024-01-19"),
    },
  ];

  console.log(`Returning ${mockComments.length} mock comments`);
  return mockComments;
}

export async function analyzeCommentSentiment(comment: string): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    // Simple rule-based sentiment analysis for faster processing
    const positiveWords = ['great', 'amazing', 'awesome', 'excellent', 'perfect', 'love', 'good', 'helpful', 'thanks', 'thank you', 'wonderful', 'fantastic', 'brilliant', 'outstanding', 'superb', 'incredible', 'best', 'recommend', 'useful', 'clear', 'easy', 'simple', 'exactly', 'looking for'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'horrible', 'useless', 'waste', 'confusing', 'difficult', 'hard', 'wrong', 'error', 'broken', 'poor', 'disappointing', 'frustrating', 'annoying', 'stupid', 'dumb', 'sucks', 'garbage', 'trash'];
    
    const lowerComment = comment.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerComment.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerComment.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      return 'positive';
    } else if (negativeCount > positiveCount) {
      return 'negative';
    } else {
      return 'neutral';
    }
  } catch (error) {
    console.error("Error analyzing comment sentiment:", error);
    return 'neutral'; // Default to neutral if analysis fails
  }
}

export async function analyzeComments(videoId: string): Promise<AnalyzedComment[]> {
  try {
    console.log(`Fetching comments for video: ${videoId}`);
    // Fetch comments
    const comments = await fetchYouTubeComments(videoId);
    console.log(`Fetched ${comments.length} comments:`, comments);
    
    // Analyze sentiment for each comment
    const analyzedComments: AnalyzedComment[] = [];
    
    for (const comment of comments) {
      const sentiment = await analyzeCommentSentiment(comment.text);
      console.log(`Comment: "${comment.text.substring(0, 50)}..." -> ${sentiment}`);
      
      analyzedComments.push({
        ...comment,
        sentiment,
      });
    }
    
    console.log(`Final analyzed comments:`, analyzedComments);
    return analyzedComments;
  } catch (error) {
    console.error("Error analyzing comments:", error);
    return [];
  }
}

// Real YouTube Data API v3 implementation (requires API key)
export async function fetchRealYouTubeComments(videoId: string, apiKey: string): Promise<YouTubeComment[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}&maxResults=100&order=relevance`
    );
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => ({
      text: item.snippet.topLevelComment.snippet.textDisplay,
      author: item.snippet.topLevelComment.snippet.authorDisplayName,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: new Date(item.snippet.topLevelComment.snippet.publishedAt),
    }));
  } catch (error) {
    console.error("Error fetching real YouTube comments:", error);
    return [];
  }
}
