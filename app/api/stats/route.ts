import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";
import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

// GET - Fetch video statistics for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = getTokenFromCookies(request);
    if (!token) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
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

    // Connect to database
    await connectDB();

    // Get video statistics
    const totalVideos = await Video.countDocuments({ userId: payload.userId });
    
    const videos = await Video.find({ userId: payload.userId })
      .select('duration transcript')
      .lean();

    const totalDuration = videos.reduce((sum, video) => sum + (video.duration || 0), 0);
    const totalWords = videos.reduce((sum, video) => {
      return sum + (video.transcript ? video.transcript.split(/\s+/).length : 0);
    }, 0);

    const stats = {
      totalVideos,
      totalDuration,
      totalWords,
    };

    return new Response(JSON.stringify({ stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: `Failed to fetch stats: ${
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
