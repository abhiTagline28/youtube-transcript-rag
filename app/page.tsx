"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Link from "next/link";

interface Stats {
  totalVideos: number;
  totalDuration: number;
  totalWords: number;
  totalDocuments: number;
  documentWords: number;
  documentPages: number;
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalVideos: 0,
    totalDuration: 0,
    totalWords: 0,
    totalDocuments: 0,
    documentWords: 0,
    documentPages: 0,
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
      const [videoStatsResponse, documentStatsResponse] = await Promise.all([
        fetch("/api/stats", { credentials: "include" }),
        fetch("/api/documents/stats", { credentials: "include" }),
      ]);

      const videoStats = videoStatsResponse.ok
        ? await videoStatsResponse.json()
        : { stats: {} };
      const documentStats = documentStatsResponse.ok
        ? await documentStatsResponse.json()
        : { stats: {} };

      setStats({
        totalVideos: videoStats.stats.totalVideos || 0,
        totalDuration: videoStats.stats.totalDuration || 0,
        totalWords: videoStats.stats.totalWords || 0,
        totalDocuments: documentStats.stats.totalDocuments || 0,
        documentWords: documentStats.stats.totalWords || 0,
        documentPages: documentStats.stats.totalPages || 0,
      });
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
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navigation />

      {user ? (
        // Authenticated user content - Dashboard
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 slide-in">
              <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-6">
                AI-Powered Dashboard
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Welcome back,{" "}
                <span className="text-white font-semibold">{user.name}</span>!
                Transform your YouTube content with cutting-edge AI technology.
              </p>
            </div>

            {/* Main Action Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {/* Upload & Transcribe */}
              <Link
                href="/upload"
                className="card ai-glow group hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
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
                  <h3 className="text-xl font-bold text-white mb-2">
                    Upload & Transcribe
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Transform YouTube videos into searchable transcripts with AI
                  </p>
                </div>
              </Link>

              {/* Video Library */}
              <Link
                href="/videos"
                className="card ai-glow group hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Video Library
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Browse and manage your transcribed video collection
                  </p>
                </div>
              </Link>

              {/* Documents */}
              <Link
                href="/documents"
                className="card ai-glow group hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Documents
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Upload and chat with PDF and DOC files
                  </p>
                </div>
              </Link>

              {/* AI Chat */}
              <Link
                href="/chat"
                className="card ai-glow group hover:scale-105 transition-all duration-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Chat</h3>
                  <p className="text-gray-400 text-sm">
                    Ask questions about your videos with intelligent AI
                  </p>
                </div>
              </Link>

              {/* Analytics */}
              <div className="card ai-glow group hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Analytics
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Insights and statistics about your content
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="card ai-glow">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Your Content Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {statsLoading ? (
                      <div className="spinner mx-auto"></div>
                    ) : (
                      stats.totalVideos
                    )}
                  </div>
                  <div className="text-gray-300 font-medium">
                    Videos Transcribed
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {statsLoading ? (
                      <div className="spinner mx-auto"></div>
                    ) : (
                      formatDuration(stats.totalDuration)
                    )}
                  </div>
                  <div className="text-gray-300 font-medium">
                    Total Duration
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {statsLoading ? (
                      <div className="spinner mx-auto"></div>
                    ) : (
                      stats.totalWords.toLocaleString()
                    )}
                  </div>
                  <div className="text-gray-300 font-medium">Video Words</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {statsLoading ? (
                      <div className="spinner mx-auto"></div>
                    ) : (
                      stats.totalDocuments
                    )}
                  </div>
                  <div className="text-gray-300 font-medium">
                    Documents Uploaded
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {statsLoading ? (
                      <div className="spinner mx-auto"></div>
                    ) : (
                      stats.documentWords.toLocaleString()
                    )}
                  </div>
                  <div className="text-gray-300 font-medium">
                    Document Words
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl border border-red-500/30">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {statsLoading ? (
                      <div className="spinner mx-auto"></div>
                    ) : (
                      stats.documentPages
                    )}
                  </div>
                  <div className="text-gray-300 font-medium">Total Pages</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Non-authenticated user content - Landing Page
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16 slide-in">
              <h1 className="text-6xl md:text-7xl font-bold gradient-text mb-6">
                AI-Powered Video Intelligence
              </h1>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
                Transform YouTube videos into searchable, intelligent content
                with cutting-edge AI technology. Transcribe, analyze, and chat
                with your videos like never before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="btn-primary text-lg px-8 py-4 ai-glow"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 border-2 border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 text-lg font-medium"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="card ai-glow text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Lightning Fast
                </h3>
                <p className="text-gray-400">
                  AI-powered transcription that works in seconds, not minutes
                </p>
              </div>

              <div className="card ai-glow text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Smart Search
                </h3>
                <p className="text-gray-400">
                  Find any moment in your videos with intelligent semantic
                  search
                </p>
              </div>

              <div className="card ai-glow text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI Chat</h3>
                <p className="text-gray-400">
                  Ask questions and get intelligent answers about your content
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="card ai-glow max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold gradient-text mb-4">
                  Ready to Transform Your Content?
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Join thousands of creators who are already using AI to unlock
                  the power of their video content.
                </p>
                <Link
                  href="/signup"
                  className="btn-primary text-lg px-8 py-4 ai-glow"
                >
                  Start Your AI Journey
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
