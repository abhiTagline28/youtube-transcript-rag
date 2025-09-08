"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

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

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
  selectedDocumentId?: string;
}

export default function DocumentList({
  onDocumentSelect,
  selectedDocumentId,
}: DocumentListProps) {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/documents", {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch documents");
      }

      setDocuments(data.documents);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setDeletingId(documentId);
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete document");
      }

      // Remove document from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Error deleting document:", err);
      alert(err instanceof Error ? err.message : "Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      default:
        return "📄";
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="text-center">
        <div className="spinner w-8 h-8 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading documents...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-300 mb-4">Please log in to view documents.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchDocuments}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-400 mb-4">📄</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No Documents Yet
        </h3>
        <p className="text-gray-400">
          Upload your first PDF or DOC file to get started with document
          analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Documents</h2>
        <button
          onClick={fetchDocuments}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {documents.map((document) => (
          <div
            key={document.id}
            className={`bg-gray-800 rounded-lg p-4 border-2 transition-all cursor-pointer ${
              selectedDocumentId === document.id
                ? "border-purple-500 bg-purple-900/20"
                : "border-gray-700 hover:border-gray-600"
            }`}
            onClick={() => onDocumentSelect?.(document)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-3xl">{getFileIcon(document.fileType)}</div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {document.fileName}
                  </h3>

                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                    <span className="uppercase font-medium">
                      {document.fileType}
                    </span>
                    <span>{formatFileSize(document.fileSize)}</span>
                    {document.pageCount && (
                      <span>{document.pageCount} pages</span>
                    )}
                    {document.wordCount && (
                      <span>{document.wordCount.toLocaleString()} words</span>
                    )}
                  </div>

                  {document.description && (
                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Uploaded {formatDate(document.createdAt)}</span>
                    {document.qaPairs && document.qaPairs.length > 0 && (
                      <span>{document.qaPairs.length} Q&A pairs</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {selectedDocumentId === document.id && (
                  <div className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                    Selected
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(document.id);
                  }}
                  disabled={deletingId === document.id}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete document"
                >
                  {deletingId === document.id ? (
                    <div className="spinner w-4 h-4"></div>
                  ) : (
                    "🗑️"
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

