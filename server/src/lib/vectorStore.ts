import { QdrantVectorStore } from "@langchain/qdrant";
import embeddings from "./embedding";

const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  collectionName: "langchainjs-testing",
});

export default vectorStore;
