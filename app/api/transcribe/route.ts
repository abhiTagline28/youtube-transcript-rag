import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video";
import { NextRequest } from "next/server";
import { getTokenFromCookies, verifyToken } from "@/lib/auth";
import { processTranscriptForRAG, processCommentsForRAG } from "@/lib/vectorStore";
import { analyzeVideo } from "@/lib/videoAnalysisService";
import { analyzeComments } from "@/lib/youtubeCommentsService";

// This will handle the POST request from your frontend
export async function POST(request: NextRequest) {
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

    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return new Response(
        JSON.stringify({ error: "Please enter a YouTube URL." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Invalid YouTube URL." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Connect to database
    await connectDB();

    // Check if video already exists for this user
    const existingVideo = await Video.findOne({
      userId: payload.userId,
      videoId: videoId,
    });

    if (existingVideo) {
      return new Response(
        JSON.stringify({
          error: "This video has already been transcribed.",
          transcript: existingVideo.transcript,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 1. Load video content using LangChain's YoutubeLoader
    const loader = YoutubeLoader.createFromUrl(youtubeUrl, {
      language: "en",
      addVideoInfo: true,
    });

    const docs = await loader.load();
    const fullText = docs.map((doc) => doc.pageContent).join(" ");

    // Extract video metadata
    const videoInfo = docs[0]?.metadata || {};
    const videoTitle = videoInfo.title || "Unknown Title";
    const thumbnailUrl = videoInfo.thumbnail_url;
    const duration = videoInfo.length_seconds;
    const authorName = videoInfo.author || "Unknown Author";
    const authorUrl = videoInfo.author_url;
    const viewCount = videoInfo.view_count;
    const likeCount = videoInfo.like_count;
    const commentCount = videoInfo.comment_count;

    // 2. Generate video analysis (description and Q&A pairs)
    let videoAnalysis;
    try {
      videoAnalysis = await analyzeVideo(videoTitle, fullText, duration);
    } catch {
      // Continue without analysis if it fails
      videoAnalysis = {
        description: "",
        qaPairs: [],
      };
    }

    // 3. Analyze comments (optional, can be done in background)
    let analyzedComments: Array<{ text: string; sentiment: 'positive' | 'negative' | 'neutral'; author: string; likeCount: number; publishedAt: Date; } > = [];
    try {
      console.log(`Starting comment analysis for video: ${videoId}`);
      analyzedComments = await analyzeComments(videoId);
      console.log(
        `Successfully analyzed ${analyzedComments.length} comments:`,
        analyzedComments
      );
    } catch (commentError) {
      console.error("Error analyzing comments:", commentError);
      // Continue without comments if it fails
    }

    // 4. Save to database
    console.log(
      `Saving video with ${analyzedComments.length} comments to database`
    );
    const video = new Video({
      userId: payload.userId,
      videoId: videoId,
      videoTitle: videoTitle,
      videoUrl: youtubeUrl,
      thumbnailUrl: thumbnailUrl,
      duration: duration,
      authorName: authorName,
      authorUrl: authorUrl,
      viewCount: viewCount,
      likeCount: likeCount,
      commentCount: commentCount,
      transcript: fullText,
      description: videoAnalysis.description,
      qaPairs: videoAnalysis.qaPairs,
      comments: analyzedComments,
    });

    await video.save();
    console.log(
      `Video saved successfully with comments:`,
      video.comments?.length || 0
    );

    // Process transcript for RAG (vector embeddings)
    try {
      await processTranscriptForRAG(
        fullText,
        videoId,
        videoTitle,
        payload.userId
      );
      console.log("Successfully processed transcript for RAG.");
    } catch (ragError) {
      console.error("Error processing transcript for RAG:", ragError);
      // Don't fail the entire request if RAG processing fails
    }

    // Process comments for RAG (vector embeddings)
    try {
      if (analyzedComments.length > 0) {
        await processCommentsForRAG(
          analyzedComments,
          videoId,
          videoTitle,
          payload.userId
        );
        console.log("Successfully processed comments for RAG.");
      }
    } catch (commentsRagError) {
      console.error("Error processing comments for RAG:", commentsRagError);
      // Don't fail the entire request if comments RAG processing fails
    }

    console.log("Successfully transcribed and stored in database.");
    return new Response(
      JSON.stringify({
        transcript: fullText,
        videoId: videoId,
        videoTitle: videoTitle,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: `Failed to process video: ${
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

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// import { YoutubeTranscript } from "youtube-transcript";
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

// // This will handle the POST request from your frontend
// export async function POST(request: Request) {
//   try {
//     const { youtubeUrl } = await request.json();

//     if (!youtubeUrl) {
//       return new Response(JSON.stringify({ error: "Please enter a YouTube URL." }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // 1. Get the video ID from the URL
//     const videoId = new URLSearchParams(new URL(youtubeUrl).search).get("v");
//     if (!videoId) {
//       return new Response(JSON.stringify({ error: "Invalid YouTube URL." }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // 2. Transcribe the video using youtube-transcript
//     const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
//     const fullText = rawTranscript.map((t) => t.text).join(" ");

//     console.log("rawTranscript : ",fullText);

//     // const loader = YoutubeLoader.createFromUrl("https://youtu.be/bZQun8Y4L2A", {
//     const loader = YoutubeLoader.createFromUrl("https://www.youtube.com/watch?v=Y8Tko2YC5hA", {
//         language: "en",
//         addVideoInfo: true,
//       });

//       const docs1 = await loader.load();
//       console.log("docs1 : ",docs1);

//     // 3. Chunk the transcript
//     const splitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 1000,
//       chunkOverlap: 200,
//     });
//     const docs = await splitter.createDocuments([fullText]);

//     // 4. Store chunks in Chroma
//     const embeddings = new OpenAIEmbeddings();
//     const vectorStore = await Chroma.fromDocuments(docs, embeddings, {
//       collectionName: "youtube-transcripts",
//       url: "http://localhost:8000",
//     });

//     console.log("Successfully transcribed and stored in Chroma.");
//     return new Response(JSON.stringify({ transcript: fullText }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: `Failed to process video: ${err instanceof Error ? err.message : String(err)}` }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }
