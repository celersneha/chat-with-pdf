import { Worker } from "bullmq";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import vectorStore from "./lib/vectorStore";
import fs from "fs";

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
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

    if (job.data.path) {
      fs.unlink(job.data.path, (err: any) => {
        if (err) {
          console.error("File delete error:", err);
        } else {
          console.log("File deleted from uploads:", job.data.path);
        }
      });
    }
  },
  {
    concurrency: 100,
    connection: { host: "localhost", port: 6379 },
  }
);
