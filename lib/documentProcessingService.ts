import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import fs from 'fs';
import path from 'path';

// Initialize the LLM for document analysis
const llm = process.env.GOOGLE_API_KEY ? new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-1.5-flash",
  temperature: 0.7,
}) : null;

export interface DocumentAnalysis {
  description: string;
  qaPairs: Array<{
    question: string;
    answer: string;
  }>;
  wordCount: number;
  pageCount?: number;
}

export async function extractTextFromPDF(filePath: string): Promise<{
  text: string;
  pageCount: number;
}> {
  try {
    console.log(`Starting PDF text extraction for: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    // Try LangChain PDFLoader first
    try {
      const loader = new PDFLoader(filePath, {
        splitPages: true,
      });
      const docs = await loader.load();
      
      console.log(`PDF loader returned ${docs.length} documents`);
      
      if (docs && docs.length > 0) {
        const fullText = docs.map((doc) => doc.pageContent).join(" ");
        const pageCount = docs.length;
        
        console.log(`Extracted text length: ${fullText.length} characters`);
        
        if (fullText && fullText.trim().length > 0) {
          return {
            text: fullText,
            pageCount,
          };
        }
      }
    } catch (langchainError) {
      console.log("LangChain PDFLoader failed, trying pdf-parse fallback:", langchainError);
    }
    
    // Fallback to pdf-parse
    console.log("Using pdf-parse fallback method");
    const dataBuffer = fs.readFileSync(filePath);
    const pdf = await import('pdf-parse');
    const data = await pdf.default(dataBuffer);
    
    console.log(`pdf-parse extracted text length: ${data.text.length} characters`);
    console.log(`pdf-parse page count: ${data.numpages}`);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("Extracted text is empty");
    }
    
    return {
      text: data.text,
      pageCount: data.numpages || 1,
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    console.error("Error details:", {
      filePath,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to extract text from PDF file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function extractTextFromDOC(filePath: string): Promise<{
  text: string;
  pageCount?: number;
}> {
  try {
    console.log(`Starting DOCX text extraction for: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    // Try LangChain DocxLoader first
    try {
      const loader = new DocxLoader(filePath);
      const docs = await loader.load();
      
      console.log(`DOCX loader returned ${docs.length} documents`);
      
      if (docs && docs.length > 0) {
        const fullText = docs.map((doc) => doc.pageContent).join(" ");
        
        console.log(`Extracted text length: ${fullText.length} characters`);
        
        if (fullText && fullText.trim().length > 0) {
          return {
            text: fullText,
            pageCount: undefined, // DOC files don't have clear page boundaries
          };
        }
      }
    } catch (langchainError) {
      console.log("LangChain DocxLoader failed, trying mammoth fallback:", langchainError);
    }
    
    // Fallback to mammoth for DOCX files
    console.log("Using mammoth fallback method for DOCX");
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      
      console.log(`mammoth extracted text length: ${result.value.length} characters`);
      
      if (!result.value || result.value.trim().length === 0) {
        throw new Error("Extracted text is empty");
      }
      
      return {
        text: result.value,
        pageCount: undefined,
      };
    } catch (mammothError) {
      console.log("Mammoth fallback also failed:", mammothError);
      throw new Error("All DOCX extraction methods failed");
    }
  } catch (error) {
    console.error("Error extracting text from DOCX file:", error);
    console.error("Error details:", {
      filePath,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to extract text from DOCX file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function extractTextFromFile(filePath: string, fileType: 'pdf' | 'doc' | 'docx'): Promise<{
  text: string;
  pageCount?: number;
}> {
  switch (fileType) {
    case 'pdf':
      return await extractTextFromPDF(filePath);
    case 'doc':
    case 'docx':
      return await extractTextFromDOC(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

export async function generateDocumentDescription(
  fileName: string,
  extractedText: string,
  fileType: string
): Promise<string> {
  try {
    if (!llm) {
      console.log("Google API key not configured, using fallback description");
      return `A ${fileType.toUpperCase()} document containing ${extractedText.split(' ').length} words.`;
    }

    const prompt = PromptTemplate.fromTemplate(`
    Analyze the following {fileType} document and provide a concise description (2-3 sentences) of its main content and purpose.

    File Name: {fileName}
    Document Type: {fileType}
    Content: {content}

    Please provide a clear, informative description that summarizes what this document is about and its key topics.
    `);

    const formattedPrompt = await prompt.format({
      fileName,
      fileType,
      content: extractedText.substring(0, 4000), // Limit content to avoid token limits
    });

    const response = await llm.invoke(formattedPrompt);
    return response.content as string;
  } catch (error) {
    console.error("Error generating document description:", error);
    return `A ${fileType.toUpperCase()} document containing ${extractedText.split(' ').length} words.`;
  }
}

export async function generateDocumentQAPairs(
  fileName: string,
  description: string,
  extractedText: string
): Promise<Array<{ question: string; answer: string }>> {
  try {
    if (!llm) {
      console.log("Google API key not configured, skipping Q&A generation");
      return [];
    }

    const prompt = PromptTemplate.fromTemplate(`
    Based on the following document, generate 3-5 relevant question-answer pairs that would be useful for someone asking questions about this document.

    Document: {fileName}
    Description: {description}
    Content: {content}

    Generate questions that cover the main topics and important information in the document. 
    Each answer should be concise but informative (2-3 sentences).

    Format your response as JSON with this structure:
    [
      {{"question": "Question 1", "answer": "Answer 1"}},
      {{"question": "Question 2", "answer": "Answer 2"}},
      ...
    ]
    `);

    const formattedPrompt = await prompt.format({
      fileName,
      description,
      content: extractedText.substring(0, 3000), // Limit content to avoid token limits
    });

    const response = await llm.invoke(formattedPrompt);
    const content = response.content as string;
    
    try {
      // Try to parse the JSON response
      const qaPairs = JSON.parse(content);
      if (Array.isArray(qaPairs)) {
        return qaPairs.slice(0, 5); // Limit to 5 Q&A pairs
      }
    } catch (parseError) {
      console.error("Error parsing Q&A pairs JSON:", parseError);
    }

    // Fallback: return empty array if parsing fails
    return [];
  } catch (error) {
    console.error("Error generating Q&A pairs:", error);
    return [];
  }
}

export async function analyzeDocument(
  fileName: string,
  extractedText: string,
  fileType: string
): Promise<DocumentAnalysis> {
  try {
    const [description, qaPairs] = await Promise.all([
      generateDocumentDescription(fileName, extractedText, fileType),
      generateDocumentQAPairs(fileName, "", extractedText),
    ]);

    const wordCount = extractedText.split(/\s+/).length;

    return {
      description,
      qaPairs,
      wordCount,
    };
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw new Error("Failed to analyze document");
  }
}

export function validateFileType(fileName: string): 'pdf' | 'doc' | 'docx' | null {
  const extension = path.extname(fileName).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return 'pdf';
    case '.doc':
      return 'doc';
    case '.docx':
      return 'docx';
    default:
      return null;
  }
}

export function validateFileSize(fileSize: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
}

export async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up file: ${filePath}`);
    }
  } catch (error) {
    console.error("Error cleaning up file:", error);
  }
}
