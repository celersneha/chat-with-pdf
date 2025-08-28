"use client";
import FileUploadComponent from "../components/custom-components/FileUploadComponent";
import ChatComponent from "../components/custom-components/Chat";
import UploadedFilesSidebar from "../components/custom-components/UploadedFiles";
import { useRef } from "react";
import ClientApp from "@/components/wrapper/ClientApp";

export default function Home() {
  const sidebarRef = useRef<{ fetchUploadedFiles: () => void }>(null);
  return (
    <ClientApp>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <UploadedFilesSidebar />

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
              <FileUploadComponent />
            </div>
          </div>
        </div>
      </div>
    </ClientApp>
  );
}
