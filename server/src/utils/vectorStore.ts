import { QdrantVectorStore } from "@langchain/qdrant";
import embeddings from "./embedding.js";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const isProd = process.env.NODE_ENV === "production";

const vectorStore = isProd
  ? new Chroma(embeddings, {
      collectionName: "PdfIQ",
      clientParams: {
        auth: {
          provider: "token",
          credentials: process.env.CHROMA_API_KEY!,
        },
        tenant: process.env.CHROMA_TENANT!,
        database: process.env.CHROMA_DATABASE!,
      },
    })
  : await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL,
      collectionName: "pdfiq",
    });

export default vectorStore;
