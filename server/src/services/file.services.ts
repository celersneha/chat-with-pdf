import { db } from "../db/index.js";
import { users } from "../db/schema/user.schema.js";
import { getUserById } from "./user.services.js";
import { eq } from "drizzle-orm";
import queue from "../utils/queue.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import vectorStore from "../utils/vectorStore.js";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const isProd = process.env.NODE_ENV === "production";

export const deleteFile = async (userId: any, fileId: any) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (Array.isArray(user.files)) {
    user.files = user.files.filter((file: any) => file.fileId !== fileId);
  } else {
    user.files = [];
  }

  const files = user.files as Array<{ fileId: any }>;

  const updatedUser = await db
    .update(users)
    .set({ files: files, uploadedFileCount: files.length })
    .where(eq(users.userid, userId))
    .returning();

  const jobData = {
    userId,
    fileId,
  };

  if (isProd) {
    // QStash: Send webhook
    await queue.publish({
      url: process.env.QSTASH_DELETE_VECTOR_DOCS_WEBHOOK_URL,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
  } else {
    // BullMQ: Add job to queue
    await queue.add("delete-vector-docs", jobData);
  }
};

export const updateDBWithUploadedFile = async (
  userId: string,
  fileName: string,
  fileId: string
) => {
  const user = await getUserById(userId);
  const newFile = { fileName, fileId };
  const updatedFiles = Array.isArray(user?.files)
    ? [...user.files, newFile]
    : [newFile];
  const updatedFileCount = (user?.uploadedFileCount ?? 0) + 1;

  await db
    .update(users)
    .set({
      uploadedFileCount: updatedFileCount,
      files: updatedFiles,
    })
    .where(eq(users.userid, userId));
};

export const processFileReadyService = async (data: any) => {
  const loader = new PDFLoader(data.path);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const splits = await splitter.splitDocuments(docs);

  const documentsWithMetadata = splits.map((doc) => ({
    ...doc,
    id: randomUUID(),
    metadata: {
      ...doc.metadata,
      fileId: data.fileId,
      fileName: data.fileName,
      userId: data.userId,
    },
  }));

  await vectorStore.addDocuments(documentsWithMetadata);

  // File delete logic (optional)
  if (data.path) {
    const normalizedPath = path.resolve(data.path);
    fs.unlink(normalizedPath, (err) => {
      if (err) {
        console.error("File delete error:", err);
      }
    });
  }
};

export const processDeleteVectorDocsService = async (
  userId: string,
  fileId: string
) => {
  // ChromaDB delete format (production)
  const chromaFilter = {
    $and: [
      { "metadata.fileId": { $eq: fileId } },
      { "metadata.userId": { $eq: userId } },
    ],
  };

  if (process.env.NODE_ENV === "production") {
    await vectorStore.delete(chromaFilter as any);
  }
};
