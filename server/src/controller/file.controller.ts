import { getAuth } from "@clerk/express";
import queue from "../lib/queue";
import { users } from "../db/schema/user.schema";
import { getUserById, canUploadFile } from "../services/user.services";
import { db } from "../db";
import {
  deleteFile as deleteFileService,
  updateDBWithUploadedFile,
} from "../services/file.services";
import { eq } from "drizzle-orm";

export const uploadFile = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    // check the uploaded file count
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
      fileId: `${userId}-${Date.now()}`,
      fileName: req.file?.originalname,
      userId: userId,
    };

    await queue.add("file-ready", JSON.stringify(jobData));

    res.json({ message: "File uploaded successfully" });
  } catch (error) {
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
