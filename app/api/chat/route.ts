import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import { askQuestion, askQuestionAboutSpecificVideo } from "@/lib/ragService";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = getTokenFromCookies(request);
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { question, videoId, maxResults } = await request.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Question is required and must be a non-empty string" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate maxResults if provided
    const resultsLimit = maxResults && typeof maxResults === "number" && maxResults > 0 && maxResults <= 10 
      ? maxResults 
      : 4;

    let response;
    
    if (videoId && typeof videoId === "string") {
      // Ask question about specific video
      response = await askQuestionAboutSpecificVideo(
        question.trim(),
        videoId,
        payload.userId,
        resultsLimit
      );
    } else {
      // Ask question across all videos
      response = await askQuestion(
        question.trim(),
        payload.userId,
        resultsLimit
      );
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in chat API:", err);
    return new Response(
      JSON.stringify({
        error: `Failed to process question: ${
          err instanceof Error ? err.message : String(err)
        }`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


