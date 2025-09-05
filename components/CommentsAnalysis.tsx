"use client";

import { useState } from "react";

interface Comment {
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  author: string;
  likeCount: number;
  publishedAt: string;
}

interface CommentsAnalysisProps {
  comments: Comment[];
  onClose?: () => void;
}

export default function CommentsAnalysis({
  comments,
  onClose,
}: CommentsAnalysisProps) {
  const [filter, setFilter] = useState<
    "all" | "positive" | "negative" | "neutral"
  >("all");

  const filteredComments = comments.filter(
    (comment) => filter === "all" || comment.sentiment === filter
  );

  const positiveComments = comments.filter((c) => c.sentiment === "positive");
  const negativeComments = comments.filter((c) => c.sentiment === "negative");
  const neutralComments = comments.filter((c) => c.sentiment === "neutral");

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "from-green-500 to-emerald-500";
      case "negative":
        return "from-red-500 to-pink-500";
      case "neutral":
        return "from-gray-500 to-gray-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "negative":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "neutral":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center ai-glow">
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Comments Analysis</h3>
            <p className="text-gray-300 text-sm">
              {comments.length} comments analyzed
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
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
        )}
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {positiveComments.length}
            </div>
            <div className="text-sm text-gray-400">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {negativeComments.length}
            </div>
            <div className="text-sm text-gray-400">Negative</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">
              {neutralComments.length}
            </div>
            <div className="text-sm text-gray-400">Neutral</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-white/10">
        <div className="flex space-x-2">
          {[
            { key: "all", label: "All", count: comments.length },
            {
              key: "positive",
              label: "Positive",
              count: positiveComments.length,
            },
            {
              key: "negative",
              label: "Negative",
              count: negativeComments.length,
            },
            { key: "neutral", label: "Neutral", count: neutralComments.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredComments.length === 0 ? (
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Comments
            </h3>
            <p className="text-gray-400">
              No comments match the current filter.
            </p>
          </div>
        ) : (
          filteredComments.map((comment, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 bg-gradient-to-r ${getSentimentColor(
                      comment.sentiment
                    )} rounded-lg flex items-center justify-center`}
                  >
                    {getSentimentIcon(comment.sentiment)}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {comment.author}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(comment.publishedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span>{comment.likeCount}</span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
