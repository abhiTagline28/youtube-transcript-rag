"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentList from "@/components/DocumentList";
import DocumentChat from "@/components/DocumentChat";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  pageCount?: number;
  wordCount?: number;
  description?: string;
  qaPairs?: Array<{
    question: string;
    answer: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"upload" | "list" | "chat">(
    "upload"
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const handleUploadSuccess = (document: Document) => {
    setSelectedDocument(document);
    setActiveTab("list");
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    setActiveTab("chat");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen animated-bg">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Document Management
            </h1>
            <p className="text-gray-300 mb-8">
              Please log in to access document features.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Document Management
          </h1>
          <p className="text-gray-300 text-lg">
            Upload, manage, and chat with your PDF and DOC files
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "upload"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "list"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              My Documents
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === "chat"
                  ? "bg-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Chat
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "upload" && (
            <DocumentUpload onUploadSuccess={handleUploadSuccess} />
          )}

          {activeTab === "list" && (
            <DocumentList
              onDocumentSelect={handleDocumentSelect}
              selectedDocumentId={selectedDocument?.id}
            />
          )}

          {activeTab === "chat" && (
            <div className="h-[600px]">
              <DocumentChat selectedDocument={selectedDocument || undefined} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

