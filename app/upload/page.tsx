"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleTranscribe = async () => {
    setLoading(true);
    setTranscript("");
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({ youtubeUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }

      setTranscript(data.transcript);
      setSuccess(true);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8 space-y-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Access Denied
            </h1>
            <p className="text-gray-500 text-lg">
              Please sign in to access the upload feature.
            </p>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Upload & Transcribe Video
            </h1>
            <p className="text-gray-500">
              Enter a YouTube video URL to transcribe its content and store it
              in the database.
            </p>
          </div>

          {/* Back to Dashboard */}
          <div className="flex justify-start">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Input Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="youtubeUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                YouTube Video URL
              </label>
              <input
                id="youtubeUrl"
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>

            <button
              onClick={handleTranscribe}
              disabled={loading || !youtubeUrl.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Transcribe and Store"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium">Error</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium">Success!</h3>
                  <p className="text-sm mt-1">
                    Video transcribed and stored successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Transcription Result
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(transcript)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                  >
                    Copy
                  </button>
                  <Link
                    href="/videos"
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    View All Videos
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                  {transcript}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
