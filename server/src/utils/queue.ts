import { Queue } from "bullmq";

const isProd = process.env.NODE_ENV === "production";

const queue = new Queue("file-processing-queue", {
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
});

export default queue;
