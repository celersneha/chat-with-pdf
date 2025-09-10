import { QdrantVectorStore } from "@langchain/qdrant";
import embeddings from "./embedding.js";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const isProd = process.env.NODE_ENV === "production";

const vectorStore = isProd
  ? new Chroma(embeddings, {
      collectionName: "PdfIQ",
    })
  : await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "pdfiq",
    });

export default vectorStore;
