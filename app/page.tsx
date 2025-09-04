"use client";

import { useState } from "react";

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTranscribe = async () => {
    setLoading(true);
    setTranscript("");
    setError("");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ youtubeUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }

      setTranscript(data.transcript);
    } catch (err) {
      console.error(err);
      setError(
        `Failed to process video: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-900">
          YouTube RAG Transcriber
        </h1>
        <p className="text-center text-gray-500">
          Enter a YouTube video URL to transcribe its content and store it in a
          vector database.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <button
            onClick={handleTranscribe}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Transcribe and Store"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-600 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {transcript && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Transcription:</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto whitespace-pre-wrap text-gray-700">
              {transcript}
            </div>
            <p className="text-sm text-green-600 text-center font-medium">
              Transcription complete and chunks stored in ChromaDB!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
