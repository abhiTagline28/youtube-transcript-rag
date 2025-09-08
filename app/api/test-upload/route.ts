import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Test basic functionality
    const testData = {
      message: "Test endpoint working",
      timestamp: new Date().toISOString(),
      environment: {
        hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
      }
    };

    return new Response(
      JSON.stringify(testData),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Test endpoint error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Test endpoint failed",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
