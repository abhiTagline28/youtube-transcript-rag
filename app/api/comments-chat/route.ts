import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import { askQuestionAboutComments, getCommentInsights } from "@/lib/commentsRagService";

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

    const { question, videoId, type = "question" } = await request.json();

    if (!question || !videoId) {
      return new Response(
        JSON.stringify({ error: "Question and videoId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let response;

    if (type === "insights") {
      // Get comment insights
      response = await getCommentInsights(videoId, payload.userId);
    } else {
      // Ask question about comments
      response = await askQuestionAboutComments(question, videoId, payload.userId);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in comments chat API:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process comment analysis request",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
