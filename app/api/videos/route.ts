import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";
import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

// GET - Fetch all videos for the authenticated user
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

    // Fetch videos for the authenticated user, sorted by creation date (newest first)
    const videos = await Video.find({ userId: payload.userId })
      .sort({ createdAt: -1 })
      .select('-transcript') // Exclude transcript from list view for performance
      .lean();

    return new Response(JSON.stringify({ videos }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: `Failed to fetch videos: ${
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

// DELETE - Delete a specific video
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

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

    // Delete the video (only if it belongs to the authenticated user)
    const deletedVideo = await Video.findOneAndDelete({
      _id: videoId,
      userId: payload.userId
    });

    if (!deletedVideo) {
      return new Response(
        JSON.stringify({ error: "Video not found or access denied" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ 
      message: "Video deleted successfully",
      deletedVideo: {
        id: deletedVideo._id,
        title: deletedVideo.videoTitle
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: `Failed to delete video: ${
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
