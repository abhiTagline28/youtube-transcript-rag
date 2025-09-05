import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";
import { analyzeVideo } from "@/lib/videoAnalysisService";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const videoId = params.id;

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Video ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to database
    await connectDB();

    // Find the video
    const video = await Video.findOne({
      videoId: videoId,
      userId: payload.userId,
    });

    if (!video) {
      return new Response(
        JSON.stringify({ error: "Video not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Regenerate analysis
    try {
      const videoAnalysis = await analyzeVideo(
        video.videoTitle,
        video.transcript,
        video.duration
      );

      // Update the video with new analysis
      video.description = videoAnalysis.description;
      video.qaPairs = videoAnalysis.qaPairs;
      await video.save();

      return new Response(
        JSON.stringify({
          success: true,
          message: "Video analysis regenerated successfully",
          description: videoAnalysis.description,
          qaPairsCount: videoAnalysis.qaPairs.length,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (analysisError) {
      console.error("Error regenerating video analysis:", analysisError);
      return new Response(
        JSON.stringify({
          error: `Failed to regenerate analysis: ${
            analysisError instanceof Error ? analysisError.message : String(analysisError)
          }`,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Error in regenerate analysis API:", err);
    return new Response(
      JSON.stringify({
        error: `Failed to regenerate analysis: ${
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
