import { db } from "../db/index.js";
import { users } from "../db/schema/user.schema.js";
import { eq } from "drizzle-orm";
import { getUserById } from "./user.services.js";
import queue from "../utils/queue.js";
import vectorStore from "../utils/vectorStore.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";
import { randomUUID } from "crypto";
import { deleteFromFilebase } from "../utils/filebase.js";
import os from "os";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

export const updateDBWithUploadedFile = async (
  userId: string,
  fileName: string,
  fileId: string
) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newFile = {
    fileId,
    fileName,
    uploadedAt: new Date().toISOString(),
  };

  const files = Array.isArray(user.files)
    ? [...user.files, newFile]
    : [newFile];

  await db
    .update(users)
    .set({ files: files, uploadedFileCount: files.length })
    .where(eq(users.userid, userId));
};

export const processFileReadyService = async (data: any) => {
  console.log("Processing file ready service:", data);

  const fileUrl = data.ipfsUrl;

  const response = await fetch(fileUrl);
  console.log("Fetched PDF response status:", response);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tempPath = path.join(os.tmpdir(), `${data.fileId}.pdf`);
  fs.writeFileSync(tempPath, buffer);

  const loader = new PDFLoader(tempPath);
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

  try {
    const resolvedVectorStore = await vectorStore;
    await resolvedVectorStore.addDocuments(documentsWithMetadata);
    console.log("✅ Documents added to vector store successfully");
  } catch (error) {
    console.error("❌ Error adding documents to vector store:", error);
  }

  fs.unlink(tempPath, (err) => {
    if (err) console.error("Temp file delete error:", err);
  });
};

export const processDeleteVectorDocsService = async (data: any) => {
  const { userId, fileId } = data;

  try {
    if (isProd) {
      // Pinecone delete format
      const pineconeFilter = {
        fileId: { $eq: fileId },
        userId: { $eq: userId },
      };
      const resolvedVectorStore = await vectorStore;
      await resolvedVectorStore.delete({ filter: pineconeFilter });
      console.log("✅ Vector documents deleted successfully (Pinecone)");
    } else {
      // Qdrant delete format
      const qdrantFilter = {
        filter: {
          must: [
            { key: "metadata.fileId", match: { value: fileId } },
            { key: "metadata.userId", match: { value: userId } },
          ],
        },
      };
      const resolvedVectorStore = await vectorStore;
      await resolvedVectorStore.delete(qdrantFilter as any);
      console.log("✅ Vector documents deleted successfully (Qdrant)");
    }
  } catch (error) {
    console.error("❌ Error deleting vectors:", error);
  }
};

export const deleteFile = async (userId: any, fileId: any) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const fileArray: Array<any> = Array.isArray(user.files) ? user.files : [];
  const fileToDelete = fileArray.find((file: any) => file.fileId === fileId);

  if (Array.isArray(user.files)) {
    user.files = user.files.filter((file: any) => file.fileId !== fileId);
  } else {
    user.files = [];
  }

  const files = user.files as Array<{ fileId: any }>;

  await db
    .update(users)
    .set({ files: files, uploadedFileCount: files.length })
    .where(eq(users.userid, userId))
    .returning();

  if (fileToDelete?.filebaseKey) {
    try {
      await deleteFromFilebase(fileToDelete.filebaseKey);
    } catch (error) {
      console.error("Error deleting from Filebase:", error);
    }
  }

  const jobData = {
    userId,
    fileId,
  };

  if (isProd) {
    await queue.publish({
      url: process.env.QSTASH_DELETE_VECTOR_DOCS_WEBHOOK_URL,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
  } else {
    await queue.add("delete-vector-docs", jobData);
  }
};
