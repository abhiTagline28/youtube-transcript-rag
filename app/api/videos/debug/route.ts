import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";

export async function GET(request: NextRequest) {
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

    // Connect to database
    await connectDB();

    // Get all videos with comments for debugging
    const videos = await Video.find({ userId: payload.userId })
      .select('videoId videoTitle comments authorName viewCount likeCount')
      .lean();

    const debugInfo = videos.map(video => ({
      videoId: video.videoId,
      videoTitle: video.videoTitle,
      authorName: video.authorName,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      hasComments: !!video.comments,
      commentsCount: video.comments ? video.comments.length : 0,
      comments: video.comments || []
    }));

    return new Response(
      JSON.stringify({ 
        totalVideos: videos.length,
        videos: debugInfo 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Debug error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
