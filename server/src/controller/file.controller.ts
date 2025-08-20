import { clerkClient, getAuth } from "@clerk/express";
import queue from "../lib/queue";
import fs from "fs";
import vectorStore from "../lib/vectorStore";
import { db } from "../db";
import { eq, count } from "drizzle-orm";
import { users } from "../db/schema/user.schema";

export const uploadFile = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    // check the uploaded file count
    const user = await db.select().from(users).where(eq(users.userid, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fileCount = user[0]?.uploadedFileCount || 0;

    if (fileCount >= 5) {
      return res.status(403).json({ error: "File upload limit reached" });
    }
    console.log(req.file);
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

  let filter: {} = {};
  if (userId) {
    filter = {
      must: [
        {
          key: "metadata.userId",
          match: { value: userId },
        },
      ],
    };
  }

  const docs = await vectorStore.similaritySearch("", 1000, filter);

  const filesMap = new Map<string, string>();
  docs.forEach((doc: any) => {
    if (doc.metadata?.fileId && doc.metadata?.fileName) {
      filesMap.set(doc.metadata.fileId, doc.metadata.fileName);
    }
  });

  const files = Array.from(filesMap.entries())
    .slice(0, 5)
    .map(([fileId, fileName]) => ({
      fileId,
      fileName,
    }));

  res.json({ documents: files });
};
