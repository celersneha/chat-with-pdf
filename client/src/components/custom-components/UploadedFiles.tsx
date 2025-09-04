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
    <aside className="w-64 bg-[var(--color-surface)] p-4 h-screen border-r border-[var(--color-accent)]/20 shadow-sm overflow-y-auto">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
        Uploaded Files
      </h3>
      {isLoading ? (
        <div className="text-[var(--color-secondary)]">Loading...</div>
      ) : files.length === 0 ? (
        <div className="text-[var(--color-secondary)]">No files uploaded.</div>
      ) : (
        <ul className="list-none p-0">
          {files.map((file: { fileId: string; fileName: string }) => (
            <li
              key={file.fileId}
              className="mb-3 flex items-center justify-between group bg-[var(--color-background)] rounded-lg px-2 py-2 border border-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/40 transition"
            >
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(file.fileId)}
                  onChange={() => toggleFile(file.fileId)}
                  className="mr-2 accent-[var(--color-accent)]"
                />
                <span className="break-all text-[var(--color-primary)]">
                  {file.fileName}
                </span>
              </label>
              <button
                onClick={() => handleDelete(file.fileId)}
                className="ml-2 text-[var(--color-accent)] font-bold text-lg opacity-70 hover:opacity-100 hover:text-[#c81e41] transition"
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
