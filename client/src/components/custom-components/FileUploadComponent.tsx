"use client";
import { Upload } from "lucide-react";
import React, { useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

const FileUploadComponent: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

        await axios.post("http://localhost:8000/upload/pdf", formData);

        console.log("File Uploaded");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border-white border-2">
      <div className="flex justify-center items-center flex-col">
        <h3>Upload PDF File</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <Button
          variant="secondary"
          className="mt-2 flex gap-2 items-center"
          onClick={handleFileUploadClick}
        >
          <Upload />
          Choose PDF
        </Button>
      </div>
    </div>
  );
};
export default FileUploadComponent;
