"use client";

import { useState, useEffect } from "react";

interface QAPair {
  question: string;
  answer: string;
}

interface VideoAnalysisData {
  videoId: string;
  videoTitle: string;
  description: string;
  qaPairs: QAPair[];
}

interface VideoAnalysisProps {
  videoId: string;
  videoTitle: string;
  onClose?: () => void;
}

export default function VideoAnalysis({
  videoId,
  videoTitle,
  onClose,
}: VideoAnalysisProps) {
  const [analysisData, setAnalysisData] = useState<VideoAnalysisData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQA, setExpandedQA] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    fetchAnalysisData();
  }, [videoId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/videos/${videoId}/analysis`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video analysis");
      }

      setAnalysisData(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch video analysis"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleQA = (index: number) => {
    setExpandedQA(expandedQA === index ? null : index);
  };

  const handleRegenerateAnalysis = async () => {
    try {
      setRegenerating(true);
      setError("");

      const response = await fetch(
        `/api/videos/${videoId}/regenerate-analysis`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate analysis");
      }

      // Refetch the analysis data
      await fetchAnalysisData();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to regenerate analysis"
      );
    } finally {
      setRegenerating(false);
    }
  };

  const handleDebugInfo = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}/debug`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get debug info");
      }

      setDebugInfo(data);
      console.log("Debug info:", data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to get debug info");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Video Analysis</h3>
              <p className="text-gray-300 text-sm">Loading analysis...</p>
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

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white text-lg">Analyzing video content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Error</h3>
              <p className="text-gray-300 text-sm">Failed to load analysis</p>
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

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Analysis Error
            </h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchAnalysisData}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium ai-glow"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Video Analysis</h3>
            <p className="text-gray-300 text-sm">"{videoTitle}"</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRegenerateAnalysis}
            disabled={regenerating}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 text-sm font-medium ai-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {regenerating ? (
              <div className="spinner w-4 h-4 mr-2"></div>
            ) : (
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
            {regenerating ? "Regenerating..." : "Regenerate"}
          </button>
          <button
            onClick={handleDebugInfo}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium ai-glow flex items-center"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Debug
          </button>
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description Section */}
        {analysisData?.description && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
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
              <h4 className="text-lg font-bold text-white">
                Video Description
              </h4>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {analysisData.description}
            </p>
          </div>
        )}

        {/* Q&A Section */}
        {analysisData?.qaPairs && analysisData.qaPairs.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center mr-3">
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">
                Frequently Asked Questions
              </h4>
            </div>

            <div className="space-y-4">
              {analysisData.qaPairs.map((qa, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => toggleQA(index)}
                    className="w-full p-4 text-left hover:bg-white/5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-white pr-4">
                        {qa.question}
                      </h5>
                      <div className="flex-shrink-0">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            expandedQA === index ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {expandedQA === index && (
                    <div className="px-4 pb-4 border-t border-white/5">
                      <p className="text-gray-300 pt-4 leading-relaxed">
                        {qa.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gradient-to-br from-yellow-800/20 to-orange-800/20 rounded-2xl p-6 border border-yellow-500/30 backdrop-blur-sm">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-white">
                Debug Information
              </h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-200">
                <strong>Has Description:</strong>{" "}
                {debugInfo.hasDescription ? "Yes" : "No"}
                {debugInfo.hasDescription &&
                  ` (${debugInfo.descriptionLength} chars)`}
              </p>
              <p className="text-yellow-200">
                <strong>Has Q&A Pairs:</strong>{" "}
                {debugInfo.hasQAPairs ? "Yes" : "No"}
                {debugInfo.hasQAPairs && ` (${debugInfo.qaPairsCount} pairs)`}
              </p>
              <p className="text-yellow-200">
                <strong>Transcript Length:</strong> {debugInfo.transcriptLength}{" "}
                chars
              </p>
              {debugInfo.qaPairs && debugInfo.qaPairs.length > 0 && (
                <div className="mt-4">
                  <p className="text-yellow-200 font-medium mb-2">Q&A Pairs:</p>
                  <div className="space-y-2">
                    {debugInfo.qaPairs.map((qa: any, index: number) => (
                      <div
                        key={index}
                        className="bg-yellow-900/30 p-3 rounded-lg"
                      >
                        <p className="text-yellow-100 font-medium">
                          Q: {qa.question}
                        </p>
                        <p className="text-yellow-200 text-xs mt-1">
                          A: {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Analysis Available */}
        {!analysisData?.description &&
          (!analysisData?.qaPairs || analysisData.qaPairs.length === 0) && (
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
              <h3 className="text-lg font-semibold text-white mb-2">
                No Analysis Available
              </h3>
              <p className="text-gray-400">
                This video doesn't have analysis data yet.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
