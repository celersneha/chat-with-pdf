import { Worker } from "bullmq";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import vectorStore from "./src/utils/vectorStore.js";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import os from "os";

const isProd = process.env.NODE_ENV === "production";

const worker = new Worker(
  "file-processing-queue",
  async (job) => {
    if (job.name === "file-ready") {
      const data = job.data;
      // Use Filebase URL instead of Firebase URL
      if (!data.filebaseUrl) {
        console.error("No filebaseUrl found in job data");
        return;
      }

      const response = await fetch(data.ipfsUrl);
      if (!response.ok) {
        console.error(`Failed to fetch PDF: ${response.statusText}`);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Save buffer to temp file
      const tempPath = path.join(os.tmpdir(), `${data.fileId}.pdf`);
      fs.writeFileSync(tempPath, buffer);

      // Load PDF from temp file
      const loader = new PDFLoader(tempPath);
      const docs = await loader.load();
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
      });

      const splits = await splitter.splitDocuments(docs);

      const documentsWithMetadata = splits.map((doc, idx) => ({
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
        await vectorStore.addDocuments(documentsWithMetadata);
      } catch (error) {
        console.error("❌ Error adding documents:", error);
      }

      // Clean up temp file
      fs.unlink(tempPath, (err: any) => {
        if (err) {
          console.error("File delete error:", err);
        }
      });
    }

    if (job.name === "delete-vector-docs") {
      const { userId, fileId } = job.data;

      try {
        if (isProd) {
          // ChromaDB delete format
          const chromaFilter = {
            $and: [
              { "metadata.fileId": { $eq: fileId } },
              { "metadata.userId": { $eq: userId } },
            ],
          };
          const result = await vectorStore.delete(chromaFilter as any);
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
          await vectorStore.delete(qdrantFilter as any);
        }
      } catch (error) {
        console.error("❌ Error deleting vectors:", error);
      }
    }
  },
  {
    concurrency: 100,
    connection: isProd
      ? {
          host: process.env.UPSTASH_REDIS_REST_URL,
          password: process.env.UPSTASH_REDIS_REST_TOKEN,
          tls: {},
        }
      : {
          host: "localhost",
          port: 6379,
        },
  }
);

export default worker;
