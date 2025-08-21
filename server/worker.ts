import { Worker } from "bullmq";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import vectorStore from "./src/lib/vectorStore";
import fs from "fs";
import path from "path";

const worker = new Worker(
  "file-processing-queue",
  async (job) => {
    if (job.name === "file-ready") {
      const data = JSON.parse(job.data);

      const loader = new PDFLoader(data.path);

      const docs = await loader.load();

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
      });

      const splits = await splitter.splitDocuments(docs);

      const documentsWithMetadata = splits.map((doc) => ({
        ...doc,
        metadata: {
          ...doc.metadata,
          fileId: data.fileId,
          fileName: data.fileName,
          userId: data.userId,
        },
      }));

      await vectorStore.addDocuments(documentsWithMetadata);

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
      const { userId, fileId } = JSON.parse(job.data);

      await vectorStore.delete({
        filter: {
          must: [
            { key: "metadata.fileId", match: { value: fileId } },
            { key: "metadata.userId", match: { value: userId } },
          ],
        },
      });
    }
  },
  {
    concurrency: 100,
    connection: { host: "localhost", port: 6379 },
  }
);
