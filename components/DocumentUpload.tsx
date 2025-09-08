"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentUploadProps {
  onUploadSuccess?: (document: any) => void;
}

export default function DocumentUpload({
  onUploadSuccess,
}: DocumentUploadProps) {
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [".pdf", ".doc", ".docx"];
      const fileExtension = selectedFile.name
        .toLowerCase()
        .substring(selectedFile.name.lastIndexOf("."));

      if (!allowedTypes.includes(fileExtension)) {
        setError("Please select a PDF, DOC, or DOCX file.");
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        return;
      }

      setFile(selectedFile);
      setError("");
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess(data.document);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to upload document"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      const allowedTypes = [".pdf", ".doc", ".docx"];
      const fileExtension = droppedFile.name
        .toLowerCase()
        .substring(droppedFile.name.lastIndexOf("."));

      if (!allowedTypes.includes(fileExtension)) {
        setError("Please select a PDF, DOC, or DOCX file.");
        return;
      }

      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        return;
      }

      setFile(droppedFile);
      setError("");
      setSuccess(false);
    }
  };

  if (authLoading) {
    return (
      <div className="text-center">
        <div className="spinner w-8 h-8 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-300 mb-4">Please log in to upload documents.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Upload Document</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file
              ? "border-green-500 bg-green-900/20"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">📄</div>

            <div>
              <p className="text-lg text-white mb-2">
                {file ? file.name : "Drag and drop your document here"}
              </p>
              <p className="text-gray-400 text-sm">or click to select a file</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />

            <label
              htmlFor="file-upload"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors"
            >
              Choose File
            </label>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>Supported formats: PDF, DOC, DOCX</p>
          <p>Maximum file size: 10MB</p>
        </div>

        {file && (
          <div className="mt-6">
            <div className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {file.name.endsWith(".pdf") ? "📄" : "📝"}
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-500 rounded-lg">
            <p className="text-green-400">Document uploaded successfully!</p>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              file && !uploading
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="spinner w-4 h-4"></div>
                <span>Uploading...</span>
              </div>
            ) : (
              "Upload Document"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

