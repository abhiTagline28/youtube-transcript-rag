"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Link from "next/link";

interface Stats {
  totalVideos: number;
  totalDuration: number;
  totalWords: number;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalVideos: 0,
    totalDuration: 0,
    totalWords: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch("/api/stats", {
        credentials: "include", // Include cookies in the request
      });
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
        // Authenticated user content - Dashboard
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8 space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                YouTube RAG Dashboard
              </h1>
              <p className="text-gray-500 text-lg">
                Welcome back, {user.name}! Choose an action to get started.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload & Transcribe Button */}
              <Link
                href="/upload"
                className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Upload & Transcribe
                  </h2>
                  <p className="text-blue-100">
                    Upload a YouTube video link and get it transcribed with
                    AI-powered transcription technology.
                  </p>
                </div>
              </Link>

              {/* Video List Button */}
              <Link
                href="/videos"
                className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Video Library</h2>
                  <p className="text-green-100">
                    View all your transcribed videos and their transcripts in
                    one organized place.
                  </p>
                </div>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Quick Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-blue-600">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-300 h-8 w-12 mx-auto rounded"></div>
                    ) : (
                      stats.totalVideos
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Videos Transcribed
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      formatDuration(stats.totalDuration)
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Duration</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-purple-600">
                    {statsLoading ? (
                      <div className="animate-pulse bg-gray-300 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      stats.totalWords.toLocaleString()
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Words Transcribed</div>
                </div>
              </div>
            </div>
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
