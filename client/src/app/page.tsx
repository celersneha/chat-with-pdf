"use client";
import FileUploadComponent from "../components/custom-components/FileUploadComponent";
import ChatComponent from "../components/custom-components/Chat";
import UploadedFilesSidebar from "../components/custom-components/UploadedFiles";
import { useRef } from "react";

export default function Home() {
  const sidebarRef = useRef<{ fetchUploadedFiles: () => void }>(null);
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <UploadedFilesSidebar sidebarRef={sidebarRef} />

      {/* Main content */}
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Chat Window */}
          <div className="bg-white rounded-lg shadow-lg border">
            <ChatComponent />
          </div>

          {/* Space between components */}
          <div className="h-4"></div>

          {/* File Upload Component */}
          <div className="flex justify-center">
            <FileUploadComponent
              onUploadSuccess={() => {
                // Add a small delay to let the worker process the file
                setTimeout(() => {
                  sidebarRef.current?.fetchUploadedFiles();
                }, 1000); // Wait 1 second
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
