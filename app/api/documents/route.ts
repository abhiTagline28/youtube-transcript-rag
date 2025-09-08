import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { processDocumentForRAG } from "@/lib/vectorStore";

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

    // Get user's documents
    const documents = await Document.find({ userId: payload.userId })
      .select("-extractedText -filePath") // Exclude large fields
      .sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({
        success: true,
        documents: documents.map(doc => ({
          id: doc._id,
          fileName: doc.originalName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          pageCount: doc.pageCount,
          wordCount: doc.wordCount,
          description: doc.description,
          qaPairs: doc.qaPairs,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching documents:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch documents" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "Document ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to database
    await connectDB();

    // Find and delete document
    const document = await Document.findOneAndDelete({
      _id: documentId,
      userId: payload.userId,
    });

    if (!document) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Clean up vector store entries for this document
    // This would require implementing a delete function in vectorStore.ts

    return new Response(
      JSON.stringify({
        success: true,
        message: "Document deleted successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error deleting document:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to delete document" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");
    const action = searchParams.get("action");

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "Document ID is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (action !== "reprocess") {
      return new Response(
        JSON.stringify({ error: "Invalid action. Only 'reprocess' is supported." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to database
    await connectDB();

    // Find document
    const document = await Document.findOne({
      _id: documentId,
      userId: payload.userId,
    });

    if (!document) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Reprocess document for RAG
    try {
      await processDocumentForRAG(
        document.extractedText,
        document._id.toString(),
        document.originalName,
        payload.userId
      );
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Document reprocessed successfully for RAG",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (ragError) {
      console.error("Error reprocessing document for RAG:", ragError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to reprocess document for RAG",
          details: ragError instanceof Error ? ragError.message : String(ragError)
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in document reprocessing:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to reprocess document" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

