import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

// This will handle the POST request from your frontend
export async function POST(request: Request) {
  try {
    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return new Response(JSON.stringify({ error: "Please enter a YouTube URL." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 1. Load video content using LangChain's YoutubeLoader
    const loader = YoutubeLoader.createFromUrl(youtubeUrl, {
      language: "en",
      addVideoInfo: true,
    });
    
    const docs = await loader.load();
    const fullText = docs.map((doc) => doc.pageContent).join(" ");
    
    // 2. Chunk the document
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunkedDocs = await splitter.splitDocuments(docs);

    // 3. Store chunks in ChromaDB with Google Generative AI Embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings();
    const vectorStore = await Chroma.fromDocuments(chunkedDocs, embeddings, {
      collectionName: "youtube-transcripts",
      url: "http://localhost:8000",
    });

    console.log("Successfully transcribed and stored in Chroma.");
    return new Response(JSON.stringify({ transcript: fullText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: `Failed to process video: ${err instanceof Error ? err.message : String(err)}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
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