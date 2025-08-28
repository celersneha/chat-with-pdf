"use client";
import { useFiles } from "@/hooks/files/useFiles";
import { useDeleteFile } from "@/hooks/files/useDeleteFile";
import { useEffect, useState } from "react";

interface UploadedFilesSidebarProps {
  onSelectionChange?: (selected: string[]) => void;
}

export default function UploadedFilesSidebar({
  onSelectionChange,
}: UploadedFilesSidebarProps) {
  const { data: files = [], isLoading } = useFiles();
  const deleteMutation = useDeleteFile();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleFile = (fileId: string) => {
    setSelected((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);

  const handleDelete = (fileId: string) => {
    deleteMutation.mutate(fileId);
  };

  return (
    <aside className="w-64 bg-gray-100 p-4 h-screen border-r border-gray-200 overflow-y-auto">
      <h3 className="mb-4 text-lg font-semibold">Uploaded Files</h3>
      {isLoading ? (
        <div>Loading...</div>
      ) : files.length === 0 ? (
        <div>No files uploaded.</div>
      ) : (
        <ul className="list-none p-0">
          {files.map((file: { fileId: string; fileName: string }) => (
            <li
              key={file.fileId}
              className="mb-3 flex items-center justify-between group"
            >
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(file.fileId)}
                  onChange={() => toggleFile(file.fileId)}
                  className="mr-2"
                />
                <span className="break-all">{file.fileName}</span>
              </label>
              <button
                onClick={() => handleDelete(file.fileId)}
                className="ml-2 text-red-500 font-bold text-lg opacity-70 hover:opacity-100 hover:text-red-700 transition"
                title="Delete"
                aria-label="Delete"
                disabled={deleteMutation.isPending}
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
