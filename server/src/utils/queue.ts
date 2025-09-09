import { Client } from "@upstash/qstash";
import { Queue } from "bullmq";

const isProd = process.env.NODE_ENV === "production";

let queue: any;
if (isProd) {
  // QStash client for production
  queue = new Client({
    token: process.env.QSTASH_TOKEN!,
  });
} else {
  // BullMQ for development
  queue = new Queue("file-processing-queue", {
    connection: {
      host: "localhost",
      port: 6379,
    },
  });
}

export default queue;
