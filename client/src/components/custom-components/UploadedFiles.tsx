"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { axiosInstance } from "@/lib/api";

type FileItem = {
  fileName: string;
  fileId: string;
};

type UploadedFilesSidebarProps = {
  sidebarRef?: React.MutableRefObject<{
    fetchUploadedFiles: () => void;
  } | null>;
};

export default function UploadedFilesSidebar({
  sidebarRef,
}: UploadedFilesSidebarProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const api = axiosInstance();

  const fetchUploadedFiles = async () => {
    setLoading(true); // ← Add this line!
    try {
      const res = await api.get(`/api/files/get-files`);
      setFiles(res.data.files || []);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Assign ref first
    if (sidebarRef) {
      sidebarRef.current = { fetchUploadedFiles };
    }
    // Then fetch initial data
    fetchUploadedFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(fileId: string) {
    try {
      const res = await api.delete(`/api/files/delete-file/${fileId}`);
      if (res.status === 200) {
        setFiles((prev) => prev.filter((file) => file.fileId !== fileId));
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }

  return (
    <aside className="w-64 bg-gray-100 p-4 h-screen border-r border-gray-200 overflow-y-auto">
      <h3 className="mb-4 text-lg font-semibold">Uploaded Files</h3>
      {loading ? (
        <div>Loading...</div>
      ) : files.length === 0 ? (
        <div>No files uploaded.</div>
      ) : (
        <ul className="list-none p-0">
          {files.map((file) => (
            <li
              key={file.fileId}
              className="mb-3 flex items-center justify-between group"
            >
              <span className="break-all">{file.fileName}</span>
              <button
                onClick={() => handleDelete(file.fileId)}
                className="ml-2 text-red-500 font-bold text-lg opacity-70 hover:opacity-100 hover:text-red-700 transition"
                title="Delete"
                aria-label="Delete"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
