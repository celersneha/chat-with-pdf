import { getAuth } from "@clerk/express";
import queue from "../utils/queue.js";
import { getUserById, canUploadFile } from "../services/user.services.js";
import {
  deleteFile as deleteFileService,
  updateDBWithUploadedFile,
  processFileReadyService,
  processDeleteVectorDocsService,
} from "../services/file.services.js";

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

    const fileId = `${userId}-${Date.now()}`;
    const fileName = req.file?.originalname;

    await updateDBWithUploadedFile(userId, fileName, fileId);

    const jobData = {
      action: "upload",
      destination: req.file?.destination,
      path: req.file?.path,
      fileId: fileId,
      fileName: fileName,
      userId: userId,
    };
    console.log(jobData);
    if (isProd) {
      console.log("Production mode: sending to QStash");
      await queue.publish({
        url: process.env.QSTASH_FILE_READY_WEBHOOK_URL,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
    } else {
      console.log("Development mode: adding to BullMQ");
      await queue.add("file-ready", jobData);
    }
    res.json({ message: "File uploaded successfully" });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFilesOfCurrentUser = async (req: any, res: any) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: userId not found" });
  }

  const user = await getUserById(userId);

  const files = user?.files ?? [];

  res.status(200).json({ files });
};

export const deleteFile = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);
    const { fileId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await deleteFileService(userId, fileId);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const processFileReady = async (req: any, res: any) => {
  try {
    await processFileReadyService(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing file-ready:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const processDeleteVectorDocs = async (req: any, res: any) => {
  try {
    const { userId } = req.body;
    const { fileId } = req.params;
    await processDeleteVectorDocsService(userId, fileId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting vectors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
