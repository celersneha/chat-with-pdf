import { getAuth } from "@clerk/express";
import queue from "../utils/queue.js";
import { getUserById, canUploadFile } from "../services/user.services.js";
import {
  deleteFile as deleteFileService,
  updateDBWithUploadedFile,
  processFileReadyService,
  processDeleteVectorDocsService,
} from "../services/file.services.js";
import { uploadPdfToFilebase } from "../utils/filebase.js"; // <-- Changed import

const isProd = process.env.NODE_ENV === "production";

export const uploadFile = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!canUploadFile(user))
      return res.status(403).json({ error: "File upload limit reached" });

    const { file, fileName, fileType } = req.body;
    if (!file || !fileName || !fileType) {
      return res.status(400).json({
        error: "Bad Request: file, fileName, and fileType are required",
      });
    }
    if (fileType !== "application/pdf") {
      return res
        .status(400)
        .json({ error: "Bad Request: only PDF files are allowed" });
    }

    const fileId = `${userId}-${Date.now()}`;
    const buffer = Buffer.from(file);

    // Upload to Filebase instead of Firebase
    const filebaseResult = await uploadPdfToFilebase(
      buffer,
      fileName,
      userId,
      fileId
    );
    await updateDBWithUploadedFile(userId, fileName, fileId);

    const jobData = {
      action: "upload",
      filebaseUrl: filebaseResult.url,
      filebaseKey: filebaseResult.filebaseKey,
      bucket: filebaseResult.bucket,
      ipfsCid: filebaseResult.ipfsCid,
      ipfsUrl: filebaseResult.ipfsUrl,
      fileId: fileId,
      fileName: fileName,
      userId: userId,
    };

    if (isProd) {
      await queue.publish({
        url: process.env.QSTASH_FILE_READY_WEBHOOK_URL,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
    } else {
      await queue.add("file-ready", jobData);
    }

    res.json({
      message: "File uploaded successfully",
      filebase: filebaseResult, // <-- Changed from firebase
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFilesOfCurrentUser = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ files: user.files || [] });
  } catch (error) {
    console.error("Get files error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteFile = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);
    const { fileId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    await deleteFileService(userId, fileId);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const processFileReady = async (req: any, res: any) => {
  try {
    await processFileReadyService(req.body);
    res.json({ message: "File processing initiated" });
  } catch (error) {
    console.error("Process file ready error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const processDeleteVectorDocs = async (req: any, res: any) => {
  try {
    await processDeleteVectorDocsService(req.body);
    res.json({ message: "Vector documents deletion initiated" });
  } catch (error) {
    console.error("Process delete vector docs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
