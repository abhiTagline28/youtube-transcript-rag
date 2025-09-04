"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
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
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      {user ? (
        // Authenticated user content
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 space-y-6">
            <h1 className="text-3xl font-extrabold text-center text-gray-900">
              YouTube RAG Transcriber
            </h1>
            <p className="text-center text-gray-500">
              Enter a YouTube video URL to transcribe its content and store it
              in a vector database.
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
                <h2 className="text-xl font-bold text-gray-800">
                  Transcription:
                </h2>
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
      ) : (
        // Non-authenticated user content
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 space-y-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Welcome to YouTube RAG Transcriber
            </h1>
            <p className="text-gray-500 text-lg">
              Transcribe YouTube videos and store them in a vector database for
              AI-powered search and analysis.
            </p>

            <div className="space-y-4">
              <p className="text-gray-600">
                Please sign in or create an account to get started.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
