import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";

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
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect to database
    await connectDB();

    // Get document statistics
    const totalDocuments = await Document.countDocuments({ userId: payload.userId });
    const totalWords = await Document.aggregate([
      { $match: { userId: payload.userId } },
      { $group: { _id: null, totalWords: { $sum: "$wordCount" } } }
    ]);

    const totalPages = await Document.aggregate([
      { $match: { userId: payload.userId } },
      { $group: { _id: null, totalPages: { $sum: "$pageCount" } } }
    ]);

    const documentsByType = await Document.aggregate([
      { $match: { userId: payload.userId } },
      { $group: { _id: "$fileType", count: { $sum: 1 } } }
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        stats: {
          totalDocuments,
          totalWords: totalWords[0]?.totalWords || 0,
          totalPages: totalPages[0]?.totalPages || 0,
          documentsByType: documentsByType.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {} as Record<string, number>),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching document stats:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch document statistics" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

