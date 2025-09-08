import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Document from "@/models/Document";
import { 
  extractTextFromFile, 
  analyzeDocument, 
  validateFileType, 
  validateFileSize,
  cleanupFile 
} from "@/lib/documentProcessingService";
import { processDocumentForRAG } from "@/lib/vectorStore";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    console.log("Document upload API called");
    
    // Check authentication
    const token = getTokenFromCookies(request);
    if (!token) {
      console.log("No authentication token provided");
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
      console.log("Invalid authentication token");
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    console.log("Authentication successful for user:", payload.userId);

    // Parse form data
    console.log("Parsing form data...");
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    console.log("File received:", file ? { name: file.name, size: file.size, type: file.type } : "No file");
    
    if (!file) {
      console.log("No file provided in form data");
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate file type
    const fileType = validateFileType(file.name);
    if (!fileType) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid file type. Only PDF, DOC, and DOCX files are allowed." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate file size (10MB limit)
    if (!validateFileSize(file.size, 10)) {
      return new Response(
        JSON.stringify({ 
          error: "File too large. Maximum size is 10MB." 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Connect to database
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    // Check if document already exists
    console.log("Checking for existing document...");
    const existingDocument = await Document.findOne({
      userId: payload.userId,
      originalName: file.name,
    });

    if (existingDocument) {
      console.log("Document already exists");
      return new Response(
        JSON.stringify({
          error: "A document with this name has already been uploaded.",
          document: existingDocument,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("No existing document found");

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "uploads", "documents");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Save file to disk
    console.log(`Saving file to: ${filePath}`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    
    // Verify file was saved
    if (!fs.existsSync(filePath)) {
      throw new Error("Failed to save file to disk");
    }
    
    const savedFileSize = fs.statSync(filePath).size;
    console.log(`File saved successfully. Size: ${savedFileSize} bytes`);

    try {
      console.log(`Starting document processing for file: ${file.name}, type: ${fileType}, path: ${filePath}`);
      
      // Extract text from document
      const { text: extractedText, pageCount } = await extractTextFromFile(filePath, fileType);

      console.log(`Text extraction completed. Text length: ${extractedText?.length || 0}`);

      if (!extractedText || extractedText.trim().length === 0) {
        await cleanupFile(filePath);
        return new Response(
          JSON.stringify({ 
            error: "Could not extract text from the document. The file might be corrupted or empty." 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Analyze document
      console.log("Analyzing document...");
      let analysis;
      try {
        analysis = await analyzeDocument(file.name, extractedText, fileType);
        console.log("Document analysis completed successfully");
      } catch (analysisError) {
        console.error("Error analyzing document:", analysisError);
        // Fallback to basic analysis
        analysis = {
          description: `A ${fileType.toUpperCase()} document containing ${extractedText.split(' ').length} words.`,
          qaPairs: [],
          wordCount: extractedText.split(' ').length,
        };
        console.log("Using fallback document analysis");
      }

      // Save document to database
      console.log("Creating document record...");
      const document = new Document({
        userId: payload.userId,
        fileName: uniqueFileName,
        originalName: file.name,
        fileType,
        fileSize: file.size,
        filePath,
        extractedText,
        pageCount,
        wordCount: analysis.wordCount,
        description: analysis.description,
        qaPairs: analysis.qaPairs,
      });

      console.log("Saving document to database...");
      await document.save();
      console.log("Document saved successfully with ID:", document._id);

      // Process document for RAG
      console.log("Processing document for RAG...");
      try {
        await processDocumentForRAG(
          extractedText,
          document._id.toString(),
          file.name,
          payload.userId
        );
        console.log("Document processed for RAG successfully");
      } catch (ragError) {
        console.error("Error processing document for RAG:", ragError);
        // Don't fail the entire upload if RAG processing fails
        console.log("Continuing without RAG processing...");
      }

      return new Response(
        JSON.stringify({
          success: true,
          document: {
            id: document._id,
            fileName: document.originalName,
            fileType: document.fileType,
            fileSize: document.fileSize,
            pageCount: document.pageCount,
            wordCount: document.wordCount,
            description: document.description,
            qaPairs: document.qaPairs,
            createdAt: document.createdAt,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (processingError) {
      // Clean up file if processing fails
      await cleanupFile(filePath);
      console.error("Error processing document:", processingError);
      throw processingError;
    }
  } catch (error) {
    console.error("Error in document upload:", error);
    
    // Ensure we always return JSON, even for unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Failed to upload document";
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
      }
    );
  }
}
