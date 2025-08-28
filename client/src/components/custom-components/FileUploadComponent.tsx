"use client";
import { Upload } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/api";
import { useUploadFile } from "@/hooks//files/useUploadFile";

interface FileUploadComponentProps {
  onUploadSuccess?: () => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onUploadSuccess,
}) => {
  const { getToken, isSignedIn } = useAuth();
  const api = axiosInstance();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentFile, setCurrentFile] = useState<{
    filename?: string;
    uploadedAt?: string;
  } | null>(null);
  const [showFileName, setShowFileName] = useState<boolean>(true);
  const uploadMutation = useUploadFile();

  // Listen for chat messages to hide filename after first chat
  useEffect(() => {
    const handleChatMessage = () => {
      setShowFileName(false);
    };

    // Listen for custom event when user sends first chat message
    window.addEventListener("firstChatSent", handleChatMessage);

    return () => {
      window.removeEventListener("firstChatSent", handleChatMessage);
    };
  }, []);

  // Reset showFileName when new file is uploaded
  useEffect(() => {
    if (currentFile) {
      setShowFileName(true);
    }
  }, [currentFile]);

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const files = ev.target.files;
    if (files && files.length > 0) {
      const file = files.item(0);
      if (file) {
        const formData = new FormData();
        formData.append("pdf", file);
        uploadMutation.mutate(formData);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Show sign-in message if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-sm w-full">
        <p className="text-gray-600 text-center">
          Please sign in to upload files
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-sm w-full">
      <div className="flex justify-center items-center flex-col w-full">
        <div className="text-center w-full">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Upload PDF
          </h3>
          <Button
            variant="default"
            size="default"
            className="flex gap-2 items-center w-full"
            onClick={handleFileUploadClick}
          >
            <Upload size={16} />
            Choose PDF
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default FileUploadComponent;
