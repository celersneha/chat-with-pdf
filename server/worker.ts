import { Worker } from "bullmq";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import vectorStore from "./src/utils/vectorStore.js";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const isProd = process.env.NODE_ENV === "production";

const worker = new Worker(
  "file-processing-queue",
  async (job) => {
    // console.log("Processing file:", job);
    if (job.name === "file-ready") {
      const data = job.data;
      const loader = new PDFLoader(data.path);

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

      const jobObject = JSON.parse(job.data);

      if (jobObject.path) {
        const normalizedPath = path.resolve(jobObject.path);
        fs.unlink(normalizedPath, (err: any) => {
          if (err) {
            console.error("File delete error:", err);
          }
        });
      }
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
