"use client";

import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";
import Link from "next/link";

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();

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
              Please sign in to chat with your video library.
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

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                  Video Library Chat
                </h1>
                <p className="text-gray-500">
                  Ask questions about your transcribed videos and get
                  intelligent answers
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/videos"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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
                  Back to Videos
                </Link>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-lg h-[600px]">
            <ChatInterface />
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 How to use Video Library Chat
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">General Questions:</h4>
                <ul className="space-y-1">
                  <li>
                    • &ldquo;What are the main topics discussed in my
                    videos?&rdquo;
                  </li>
                  <li>
                    • &ldquo;Summarize the key points from my recent
                    uploads&rdquo;
                  </li>
                  <li>
                    • &ldquo;What programming concepts are covered?&rdquo;
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Specific Searches:</h4>
                <ul className="space-y-1">
                  <li>• &ldquo;Find videos about machine learning&rdquo;</li>
                  <li>• &ldquo;What did I say about React hooks?&rdquo;</li>
                  <li>• &ldquo;Show me content about database design&rdquo;</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
