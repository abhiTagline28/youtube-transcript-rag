"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import ChatInterface from "@/components/ChatInterface";
import VideoAnalysis from "@/components/VideoAnalysis";
import CommentsAnalysis from "@/components/CommentsAnalysis";
import Link from "next/link";
import Image from "next/image";

interface Video {
  _id: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  authorName?: string;
  authorUrl?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  transcript: string;
  description?: string;
  qaPairs?: Array<{
    question: string;
    answer: string;
  }>;
  comments?: Array<{
    text: string;
    sentiment: "positive" | "negative" | "neutral";
    author: string;
    likeCount: number;
    publishedAt: string;
  }>;
  createdAt: string;
}

export default function VideosPage() {
  const { user, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    video: Video | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    video: null,
    isLoading: false,
  });
  const [chatModal, setChatModal] = useState<{
    isOpen: boolean;
    video: Video | null;
  }>({
    isOpen: false,
    video: null,
  });
  const [analysisModal, setAnalysisModal] = useState<{
    isOpen: boolean;
    video: Video | null;
  }>({
    isOpen: false,
    video: null,
  });
  const [commentsModal, setCommentsModal] = useState<{
    isOpen: boolean;
    video: Video | null;
  }>({
    isOpen: false,
    video: null,
  });

  useEffect(() => {
    if (user) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/videos", {
        credentials: "include", // Include cookies in the request
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch videos");
      }

      setVideos(data.videos);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoWithTranscript = async (videoId: string) => {
    try {
      setLoadingTranscript(true);
      const response = await fetch(`/api/videos/${videoId}`, {
        credentials: "include", // Include cookies in the request
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video transcript");
      }

      setSelectedVideo(data.video);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch video transcript"
      );
    } finally {
      setLoadingTranscript(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = (video: Video) => {
    setDeleteModal({
      isOpen: true,
      video,
      isLoading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.video) return;

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(
        `/api/videos?videoId=${deleteModal.video._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete video");
      }

      // Remove the video from the local state
      setVideos((prev) =>
        prev.filter((video) => video._id !== deleteModal.video!._id)
      );

      // Close the modal
      setDeleteModal({
        isOpen: false,
        video: null,
        isLoading: false,
      });

      // Show success message (optional)
      setError(""); // Clear any existing errors
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to delete video");
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      video: null,
      isLoading: false,
    });
  };

  const handleChatClick = (video: Video) => {
    setChatModal({
      isOpen: true,
      video,
    });
  };

  const handleChatClose = () => {
    setChatModal({
      isOpen: false,
      video: null,
    });
  };

  const handleAnalysisClick = (video: Video) => {
    setAnalysisModal({
      isOpen: true,
      video,
    });
  };

  const handleAnalysisClose = () => {
    setAnalysisModal({
      isOpen: false,
      video: null,
    });
  };

  const handleCommentsClick = (video: Video) => {
    setCommentsModal({
      isOpen: true,
      video,
    });
  };

  const handleCommentsClose = () => {
    setCommentsModal({
      isOpen: false,
      video: null,
    });
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

  if (!user) {
    return (
      <div className="min-h-screen animated-bg">
        <Navigation />
        <div className="pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card ai-glow">
              <h1 className="text-4xl font-bold gradient-text mb-4">
                Access Required
              </h1>
              <p className="text-gray-300 text-lg mb-8">
                Please sign in to view your AI-powered video library.
              </p>
              <Link href="/login" className="btn-primary ai-glow">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navigation />

      <div className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 slide-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                  AI Video Library
                </h1>
                <p className="text-gray-300 text-lg">
                  Your intelligent video collection with AI-powered search and
                  chat
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                <Link
                  href="/upload"
                  className="btn-primary ai-glow inline-flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Video
                </Link>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="spinner mx-auto mb-4"></div>
                <p className="text-white text-lg">
                  Loading your AI video library...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="card ai-glow mb-8 border-red-500/30 bg-red-500/10">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Error Loading Videos
                  </h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {!loading && !error && (
            <>
              {videos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="card ai-glow max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-10 h-10 text-white"
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
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No Videos Yet
                    </h3>
                    <p className="text-gray-300 mb-8">
                      Start building your AI-powered video library by uploading
                      your first video.
                    </p>
                    <Link
                      href="/upload"
                      className="btn-primary ai-glow inline-flex items-center justify-center"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Upload Your First Video
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {videos.map((video, index) => (
                    <div
                      key={video._id}
                      className="card ai-glow group hover:scale-105 transition-all duration-300 slide-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl relative overflow-hidden mb-4">
                        {video.thumbnailUrl ? (
                          <Image
                            src={video.thumbnailUrl}
                            alt={video.videoTitle}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
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
                          </div>
                        )}
                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-lg font-medium">
                          {formatDuration(video.duration)}
                        </div>
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded-lg font-medium">
                          AI Ready
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-bold text-white mb-2 line-clamp-2 text-lg">
                          {video.videoTitle}
                        </h3>

                        {/* Author and Stats */}
                        <div className="mb-3">
                          {video.authorName && (
                            <p className="text-cyan-400 text-sm font-medium mb-1">
                              by {video.authorName}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            {video.viewCount && (
                              <span className="flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {video.viewCount.toLocaleString()} views
                              </span>
                            )}
                            {video.likeCount && (
                              <span className="flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                {video.likeCount.toLocaleString()} likes
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-400 text-sm mb-4">
                          Transcribed on {formatDate(video.createdAt)}
                        </p>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() =>
                                fetchVideoWithTranscript(video._id)
                              }
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium ai-glow"
                            >
                              View Transcript
                            </button>
                            <a
                              href={video.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm font-medium text-center flex items-center justify-center"
                            >
                              Watch Video
                            </a>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handleChatClick(video)}
                              className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-sm font-medium flex items-center justify-center ai-glow"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
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
                              Chat
                            </button>
                            <button
                              onClick={() => handleAnalysisClick(video)}
                              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 text-sm font-medium flex items-center justify-center ai-glow shadow-md hover:shadow-purple-500/25 border border-purple-400/20"
                            >
                              <div className="w-4 h-4 mr-1 bg-white/20 rounded flex items-center justify-center">
                                <svg
                                  className="w-2.5 h-2.5"
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
                              Analysis
                            </button>
                            <button
                              onClick={() => handleCommentsClick(video)}
                              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 text-sm font-medium flex items-center justify-center ai-glow shadow-md hover:shadow-cyan-500/25 border border-cyan-400/20"
                            >
                              <div className="w-4 h-4 mr-1 bg-white/20 rounded flex items-center justify-center">
                                <svg
                                  className="w-2.5 h-2.5"
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
                              Comments
                            </button>
                            <button
                              onClick={() => handleDeleteClick(video)}
                              className="px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium flex items-center justify-center ai-glow"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Transcript Modal */}
          {selectedVideo && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="card ai-glow max-w-5xl w-full max-h-[85vh] overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedVideo.videoTitle}
                      </h2>
                      <p className="text-gray-400">
                        Transcribed on {formatDate(selectedVideo.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200"
                    >
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto max-h-[65vh]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-white"
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
                      AI Transcript
                    </h3>
                    {selectedVideo.transcript && (
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            selectedVideo.transcript
                          )
                        }
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium ai-glow"
                      >
                        Copy Transcript
                      </button>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-white/10">
                    {loadingTranscript ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="spinner mx-auto mb-4"></div>
                          <p className="text-white">Loading AI transcript...</p>
                        </div>
                      </div>
                    ) : selectedVideo.transcript ? (
                      <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed font-mono">
                        {selectedVideo.transcript}
                      </pre>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-400">No transcript available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            title="Delete Video"
            message={`Are you sure you want to delete "${deleteModal.video?.videoTitle}"? This action cannot be undone and will permanently remove the video and its transcript from your library.`}
            confirmText="Delete Video"
            cancelText="Cancel"
            isLoading={deleteModal.isLoading}
            type="danger"
          />

          {/* Chat Modal */}
          {chatModal.isOpen && chatModal.video && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="card ai-glow max-w-5xl w-full h-[700px] overflow-hidden">
                <ChatInterface
                  videoId={chatModal.video.videoId}
                  videoTitle={chatModal.video.videoTitle}
                  onClose={handleChatClose}
                />
              </div>
            </div>
          )}

          {/* Analysis Modal */}
          {analysisModal.isOpen && analysisModal.video && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="card ai-glow max-w-5xl w-full h-[700px] overflow-hidden">
                <VideoAnalysis
                  videoId={analysisModal.video.videoId}
                  videoTitle={analysisModal.video.videoTitle}
                  onClose={handleAnalysisClose}
                />
              </div>
            </div>
          )}

          {/* Comments Modal */}
          {commentsModal.isOpen && commentsModal.video && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="card ai-glow max-w-5xl w-full h-[700px] overflow-hidden">
                <CommentsAnalysis
                  comments={commentsModal.video.comments || []}
                  videoId={commentsModal.video.videoId}
                  videoTitle={commentsModal.video.videoTitle}
                  onClose={handleCommentsClose}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
