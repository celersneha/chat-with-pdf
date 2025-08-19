"use client";
import { Upload, File, X } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

const FileUploadComponent: React.FC = () => {
  const { getToken, isSignedIn } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentFile, setCurrentFile] = useState<{
    filename?: string;
    uploadedAt?: string;
  } | null>(null);
  const [showFileName, setShowFileName] = useState<boolean>(true);

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
        if (!isSignedIn) {
          console.error("User not signed in");
          return;
        }

        try {
          const token = await getToken();

          const formData = new FormData();
          formData.append("pdf", file);

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setCurrentFile(res.data.file);
          setShowFileName(true);
        } catch (error: any) {
          console.error("❌ File upload error:", error);
          if (error.response) {
            console.error("Error response:", error.response.data);
            console.error("Error status:", error.response.status);
          }
        }
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = async () => {
    try {
      if (!isSignedIn) return;

      const token = await getToken();
      await axios.delete("http://localhost:8000/remove-file", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentFile(null);
      setShowFileName(true);
    } catch (error) {
      console.error("Error removing file:", error);
      // Still remove from UI even if API call fails
      setCurrentFile(null);
      setShowFileName(true);
    }
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
        {currentFile ? (
          <div className="text-center w-full">
            {showFileName && (
              <>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Current PDF
                </h3>
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between w-full mb-4">
                  <div className="flex items-center gap-2 flex-1">
                    <File size={16} className="text-blue-600" />
                    <span className="text-sm truncate text-gray-700">
                      {currentFile.filename}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </>
            )}
            <Button
              variant="outline"
              size="default"
              className="flex gap-2 items-center w-full"
              onClick={handleFileUploadClick}
            >
              <Upload size={16} />
              {showFileName ? "Change PDF" : "Upload PDF"}
            </Button>
          </div>
        ) : (
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
        )}
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
