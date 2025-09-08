"use client";

import { useState, useRef, useEffect } from "react";

interface Comment {
  text: string;
  sentiment: "positive" | "negative" | "neutral";
  author: string;
  likeCount: number;
  publishedAt: string;
}

interface CommentsAnalysisProps {
  comments: Comment[];
  videoId: string;
  videoTitle: string;
  onClose?: () => void;
}

export default function CommentsAnalysis({
  comments,
  videoId,
  videoTitle,
  onClose,
}: CommentsAnalysisProps) {
  const [filter, setFilter] = useState<
    "all" | "positive" | "negative" | "neutral"
  >("all");
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      type: "user" | "ai";
      content: string;
      timestamp: Date;
    }>
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const currentMessage = inputMessage.trim();
    setInputMessage(""); // Clear input immediately

    const userMessage = {
      type: "user" as const,
      content: currentMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/comments-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentMessage,
          videoId: videoId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const aiMessage = {
        type: "ai" as const,
        content: data.answer,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        type: "ai" as const,
        content:
          "Sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-white"
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
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
              showChat
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-green-500/25"
                : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
            }`}
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
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
              <span>{showChat ? "Show Comments" : "Ask AI"}</span>
            </div>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            >
              <svg
                className="w-5 h-5 text-white"
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
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-white/10 bg-gradient-to-r from-gray-800/30 to-gray-700/30">
        <div className="grid grid-cols-5 gap-3">
          <div className="text-center bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-xl p-3 border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {comments.length}
            </div>
            <div className="text-xs text-purple-300 font-medium">Total</div>
          </div>
          <div className="text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-3 border border-green-500/20">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {positiveComments.length}
            </div>
            <div className="text-xs text-green-300 font-medium">Positive</div>
          </div>
          <div className="text-center bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-3 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {negativeComments.length}
            </div>
            <div className="text-xs text-red-300 font-medium">Negative</div>
          </div>
          <div className="text-center bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-3 border border-gray-500/20">
            <div className="text-2xl font-bold text-gray-400 mb-1">
              {neutralComments.length}
            </div>
            <div className="text-xs text-gray-300 font-medium">Neutral</div>
          </div>
          <div className="text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-3 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.round((positiveComments.length / comments.length) * 100) ||
                0}
              %
            </div>
            <div className="text-xs text-blue-300 font-medium">Positive %</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-white/10">
        <div className="flex space-x-2">
          {[
            {
              key: "all",
              label: "All",
              count: comments.length,
              color: "from-purple-500 to-indigo-500",
            },
            {
              key: "positive",
              label: "Positive",
              count: positiveComments.length,
              color: "from-green-500 to-emerald-500",
            },
            {
              key: "negative",
              label: "Negative",
              count: negativeComments.length,
              color: "from-red-500 to-pink-500",
            },
            {
              key: "neutral",
              label: "Neutral",
              count: neutralComments.length,
              color: "from-gray-500 to-gray-600",
            },
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() =>
                setFilter(key as "all" | "positive" | "negative" | "neutral")
              }
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg ${
                filter === key
                  ? `bg-gradient-to-r ${color} text-white hover:shadow-lg`
                  : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    filter === key ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  {count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ maxHeight: "400px" }}
          >
            {chatMessages.length === 0 ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
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
                <h3 className="text-lg font-bold text-white mb-2">
                  Ask About Comments
                </h3>
                <p className="text-gray-300 mb-3 text-sm">
                  Ask questions about viewer feedback, sentiment trends, or
                  specific comments.
                </p>
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-3 border border-white/10">
                  <h4 className="text-white font-semibold mb-2 text-center text-xs">
                    Try asking:
                  </h4>
                  <div className="space-y-1 text-left">
                    <div className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 text-xs">
                        &quot;What do viewers like most about this video?&quot;
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 text-xs">
                        &quot;What are the main complaints?&quot;
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-300 text-xs">
                        &quot;Show me the most liked comments&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        : "bg-gradient-to-r from-gray-700 to-gray-600 text-white"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 border-t border-white/10">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about the comments..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  disabled={isLoading}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/25 flex items-center justify-center min-w-[50px]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div
        className={`flex-1 overflow-y-auto p-6 space-y-4 ${
          showChat ? "hidden" : ""
        }`}
      >
        {filteredComments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg
                className="w-10 h-10 text-gray-400"
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
            <h3 className="text-xl font-bold text-white mb-3">No Comments</h3>
            <p className="text-gray-400 text-lg">
              No comments match the current filter.
            </p>
          </div>
        ) : (
          filteredComments.map((comment, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${getSentimentColor(
                      comment.sentiment
                    )} rounded-2xl flex items-center justify-center shadow-lg`}
                  >
                    {getSentimentIcon(comment.sentiment)}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {comment.author}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDate(comment.publishedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400 bg-white/5 px-3 py-2 rounded-full">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="font-medium">{comment.likeCount}</span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed text-base">
                {comment.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
