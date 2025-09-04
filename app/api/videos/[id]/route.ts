import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";
import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";

// GET - Fetch a specific video with transcript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch the specific video (only if it belongs to the authenticated user)
    const video = await Video.findOne({
      _id: videoId,
      userId: payload.userId
    }).lean();

    if (!video) {
      return new Response(
        JSON.stringify({ error: "Video not found or access denied" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ video }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: `Failed to fetch video: ${
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
