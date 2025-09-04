"use client";
import FileUploadComponent from "@/components/custom-components/FileUploadComponent";
import ChatComponent from "@/components/custom-components/Chat";
import UploadedFilesSidebar from "@/components/custom-components/UploadedFiles";
import { useState, useEffect } from "react";
import ClientApp from "@/components/wrapper/ClientApp";
import Loading from "@/components/custom-components/Loading";
import { usePathname } from "next/navigation";

export default function Home() {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (window.location.hash) {
      window.scrollTo(0, 0);
      history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <ClientApp>
      <div className="min-h-screen bg-gray-50 flex pt-24">
        {/* Sidebar */}
        <UploadedFilesSidebar onSelectionChange={setSelectedFileIds} />

        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Chat Window */}
            <div className="bg-white rounded-lg shadow-lg border border-[var(--color-accent)]/40">
              {isChatLoading ? (
                <Loading />
              ) : (
                <ChatComponent selectedFileIds={selectedFileIds} />
              )}
            </div>

            {/* Space between components */}
            <div className="h-4"></div>

            {/* File Upload Component */}
            <div className="flex justify-center">
              {isUploading ? <Loading /> : <FileUploadComponent />}
            </div>
          </div>
        </div>
      </div>
    </ClientApp>
  );
}
