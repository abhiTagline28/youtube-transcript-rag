import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";

// Initialize the LLM
const llm = process.env.GOOGLE_API_KEY ? new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
  temperature: 0.7,
}) : null;

// Prompt for generating video description
const DESCRIPTION_PROMPT = PromptTemplate.fromTemplate(`
Based on the following video transcript, generate a comprehensive and engaging description of the video content.

Video Title: {videoTitle}
Video Duration: {duration} seconds

Transcript:
{transcript}

Instructions:
1. Create a 2-3 paragraph description that summarizes the main topics and key points
2. Make it engaging and informative for someone who hasn't watched the video
3. Highlight the most important insights or takeaways
4. Keep the tone professional but accessible
5. Do not include timestamps or specific references to video segments

Description:`);

// Prompt for generating Q&A pairs
const QA_PROMPT = PromptTemplate.fromTemplate(`
Based on the following video transcript, generate 5-7 relevant question and answer pairs that would be commonly asked about this video content.

Video Title: {videoTitle}
Video Description: {description}

Transcript:
{transcript}

Instructions:
1. Generate diverse questions that cover different aspects of the video content
2. Questions should be practical and commonly asked by viewers
3. Answers should be comprehensive but concise (2-3 sentences each)
4. Include both high-level overview questions and specific detail questions
5. Make sure answers are based only on the transcript content
6. IMPORTANT: Return ONLY a valid JSON array, no other text

Return format (JSON array only):
[
  {{
    "question": "What is the main topic of this video?",
    "answer": "The main topic is..."
  }},
  {{
    "question": "What are the key takeaways?",
    "answer": "The key takeaways include..."
  }},
  {{
    "question": "Who is this video for?",
    "answer": "This video is designed for..."
  }},
  {{
    "question": "What will I learn from this video?",
    "answer": "You will learn..."
  }},
  {{
    "question": "What are the main points covered?",
    "answer": "The main points covered include..."
  }}
]`);

export interface VideoDescription {
  description: string;
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface VideoAnalysis {
  description: string;
  qaPairs: QAPair[];
}

export async function generateVideoDescription(
  videoTitle: string,
  transcript: string,
  duration?: number
): Promise<VideoDescription> {
  try {
    const prompt = await DESCRIPTION_PROMPT.format({
      videoTitle,
      duration: duration || "Unknown",
      transcript: transcript.substring(0, 8000), // Limit transcript length for API
    });

    const response = await llm.invoke(prompt);
    const description = response.content as string;

    return {
      description: description.trim(),
    };
  } catch (error) {
    console.error("Error generating video description:", error);
    throw new Error("Failed to generate video description");
  }
}

export async function generateQAPairs(
  videoTitle: string,
  description: string,
  transcript: string
): Promise<QAPair[]> {
  try {
    const prompt = await QA_PROMPT.format({
      videoTitle,
      description,
      transcript: transcript.substring(0, 8000), // Limit transcript length for API
    });

    const response = await llm.invoke(prompt);
    const content = response.content as string;

    console.log("Q&A Generation - Raw LLM response:", content);

    // Try to parse JSON response
    try {
      // Clean the content to extract JSON
      let jsonContent = content.trim();
      
      // Look for JSON array in the response
      const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
        console.log("Q&A Generation - Extracted JSON:", jsonContent);
      }
      
      const qaPairs = JSON.parse(jsonContent);
      if (Array.isArray(qaPairs) && qaPairs.length > 0) {
        console.log("Q&A Generation - Successfully parsed", qaPairs.length, "Q&A pairs");
        return qaPairs.map((qa: any) => ({
          question: qa.question || "",
          answer: qa.answer || "",
        }));
      } else {
        console.log("Q&A Generation - No valid Q&A pairs found in response");
      }
    } catch (parseError) {
      console.error("Error parsing Q&A JSON:", parseError);
      console.error("Raw content:", content);
    }

    // Fallback: return empty array if parsing fails
    return [];
  } catch (error) {
    console.error("Error generating Q&A pairs:", error);
    throw new Error("Failed to generate Q&A pairs");
  }
}

export async function analyzeVideo(
  videoTitle: string,
  transcript: string,
  duration?: number
): Promise<VideoAnalysis> {
  try {
    // Generate description first
    const descriptionResult = await generateVideoDescription(
      videoTitle,
      transcript,
      duration
    );

    // Generate Q&A pairs using the description
    const qaPairs = await generateQAPairs(
      videoTitle,
      descriptionResult.description,
      transcript
    );

    return {
      description: descriptionResult.description,
      qaPairs,
    };
  } catch (error) {
    console.error("Error analyzing video:", error);
    throw new Error("Failed to analyze video content");
  }
}
