import { QdrantVectorStore } from "@langchain/qdrant";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import embeddings from "./embedding.js";

const isProd = process.env.NODE_ENV === "production";

const vectorStore = isProd
  ? (async () => {
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
      });

      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

      return await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
        namespace: "pdfiq-docs", // Optional namespace
      });
    })()
  : await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "pdfiq",
    });

export default vectorStore;
