import { Worker } from "bullmq";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import vectorStore from "./src/lib/vectorStore";
import fs from "fs";
import path from "path";
import { users } from "./src/db/schema/user.schema";
import { db } from "./src/db";
import { eq } from "drizzle-orm";
import { files } from "@mistralai/mistralai";

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

    const jobObject = JSON.parse(job.data);

    if (jobObject.path) {
      const normalizedPath = path.resolve(jobObject.path);
      fs.unlink(normalizedPath, (err: any) => {
        if (err) {
          console.error("File delete error:", err);
        } else {
          console.log("File deleted from uploads:", normalizedPath);
        }
      });

      const user = await db
        .select()
        .from(users)
        .where(eq(users.userid, jobObject.userId));

      // increment upload file count
      if (user && user.length > 0) {
        await db
          .update(users)
          .set({
            uploadedFileCount: (user[0]?.uploadedFileCount ?? 0) + 1,
            files: [
              ...(Array.isArray(user[0]?.files) ? user[0]?.files : []),
              { fileName: jobObject.fileName, fileId: jobObject.fileId },
            ],
          })
          .where(eq(users.userid, jobObject.userId));
      }
    }
  },
  {
    concurrency: 100,
    connection: { host: "localhost", port: 6379 },
  }
);
