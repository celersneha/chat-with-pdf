import {
  SystemMessage,
  HumanMessage,
  RemoveMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  Annotation,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import vectorStore from "./vectorStore";
import { ChatMistralAI } from "@langchain/mistralai";

const memory = new MemorySaver();

const model = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,

  userId: Annotation<string>({
    reducer: (_, action) => action,
    default: () => "",
  }),

  selectedFileIds: Annotation<string[]>({
    reducer: (_, action) => action,
    default: () => [],
  }),

  summary: Annotation<string>({
    reducer: (_, action) => action,
    default: () => "",
  }),
});

// Updated PDF Retriever according to your codebase
const pdfRetriever = tool(
  async ({ query, userId, fileIds }) => {
    // Validate inputs
    if (!userId) {
      return "Error: User authentication required.";
    }

    if (!fileIds || fileIds.length === 0) {
      return "Error: Please select at least one file to search.";
    }

    // Create filter matching your existing chat controller logic
    const filter = {
      must: [
        { key: "metadata.userId", match: { value: userId } },
        { key: "metadata.fileId", match: { any: fileIds } },
      ],
    };

    try {
      // Use 5 docs as per your existing controller (adjustable)
      const results = await vectorStore.similaritySearch(query, 5, filter);

      if (results.length === 0) {
        return "No relevant content found in the selected files. Please try rephrasing your question or selecting different files.";
      }

      // Extract page contents matching your existing logic
      const pageContents = results.map((doc) => doc.pageContent);
      const contextText = pageContents.join("\n---\n");

      // Use your existing system prompt pattern
      const SYSTEM_PROMPT = `You are a helpful AI Assistant who answers the user query based on the available PDF file context. 
      
Context: ${contextText}

Instructions:
- Answer based only on the provided context
- If the answer is not in the context, say so
- Be concise and accurate
      `;

      const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(query),
      ]);

      // console.log("PDF Retriever response:", response);

      return response.content || "No relevant information found.";
    } catch (error) {
      console.error("PDF Retriever error:", error);
      return "Error occurred while searching the documents. Please try again.";
    }
  },
  {
    name: "pdfRetriever",
    description:
      "Search and answer questions from selected PDF files using vector similarity search",
    schema: z.object({
      query: z
        .string()
        .describe("The user's question to be answered using PDF content"),
      userId: z.string().describe("The authenticated user's ID"),
      fileIds: z
        .array(z.string())
        .describe("Array of selected file IDs to search within"),
    }),
  }
);

// Create tool node
const tools = [pdfRetriever];
const toolNode = new ToolNode(tools);

// Bind tools to model
const modelWithTools = model.bindTools(tools);

// Define the main chat function that calls tools
async function callModel(
  state: typeof GraphAnnotation.State
): Promise<Partial<typeof GraphAnnotation.State>> {
  const { messages, userId, selectedFileIds, summary } = state;

  // Get recent ToolMessages
  let recentToolMessages: ToolMessage[] = [];
  for (let i = state["messages"].length - 1; i >= 0; i--) {
    let message = state["messages"][i];
    if (message instanceof ToolMessage) {
      recentToolMessages.push(message);
    } else {
      break;
    }
  }
  let toolMessages = recentToolMessages.reverse();

  // Format tool messages content
  const docsContent = toolMessages.map((doc) => doc.content).join("\n");

  const SYSTEM_PROMPT = `You are a helpful AI Assistant who answers the user query based on the available PDF file context.
  
Instructions:
- Answer based only on the provided context
- If the answer is not in the context, say so
- Be concise and accurate
- Mention the entire content which is retrieved
- Give a summarized content if the answer is very long

User ID: ${userId}
Selected Files: ${selectedFileIds.join(", ")}`;

  // Prepare system message with summary if available
  let systemMessage: SystemMessage;
  if (summary) {
    systemMessage = new SystemMessage({
      id: uuidv4(),
      content: `${SYSTEM_PROMPT} \n\nYou have a summary of the conversation so far. Use it to provide context for your response. \n\nSummary: ${summary}`,
    });
  } else {
    systemMessage = new SystemMessage({
      id: uuidv4(),
      content: SYSTEM_PROMPT,
    });
  }

  // Build final messages array
  let finalMessages = [systemMessage];

  // If there are tool messages, add their content as a HumanMessage for context
  if (docsContent.trim().length > 0) {
    finalMessages.push(
      new HumanMessage({
        id: uuidv4(),
        content: `Relevant info from tools:\n${docsContent}`,
      })
    );
  }

  const conversationMessages = messages.filter(
    (message) =>
      message instanceof HumanMessage ||
      message instanceof SystemMessage ||
      message instanceof AIMessage
  );

  // Add the rest of the conversation messages
  finalMessages = [...finalMessages, ...conversationMessages];

  // Invoke the model
  const response = await modelWithTools.invoke(finalMessages);
  return {
    messages: [response],
    userId: userId,
    selectedFileIds: selectedFileIds,
  };
}

function conversationCondition(
  state: typeof GraphAnnotation.State
): "tools" | "summarize_conversation" | typeof END {
  const messages = state.messages;
  const lastMessage = messages.at(-1);

  // console.log("Checking condition - messages length:", messages.length);
  // console.log("Last message type:", lastMessage?.constructor.name);

  // Tool call check - if the last message has tool calls
  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray((lastMessage as any).tool_calls) &&
    (lastMessage as any).tool_calls.length > 0
  ) {
    // console.log("Going to tools");
    return "tools";
  }

  // Count only user messages for summarization trigger
  const userMessageCount = messages.filter(
    (msg) => msg.constructor.name === "HumanMessage"
  ).length;
  // console.log("User message count:", userMessageCount);

  // Summarize after every 3 user messages instead of total message count
  if (userMessageCount >= 3) {
    // console.log("Going to summarize");
    return "summarize_conversation";
  }

  // console.log("Going to END");
  return END;
}

async function summarizeConversation(
  state: typeof GraphAnnotation.State
): Promise<Partial<typeof GraphAnnotation.State>> {
  // console.log("Summarizing conversation (summarizeConversation)");
  const { summary, messages, userId, selectedFileIds } = state;
  let summaryMessage;

  if (summary) {
    summaryMessage =
      `This is summary of the conversation to date: ${summary}\n\n` +
      "Extend the summary by taking into account the new messages above. Respond with plain text only:";
  } else {
    summaryMessage =
      "Create a summary of the conversation above. Respond with plain text only:";
  }

  const allMessages = [
    ...messages,
    new HumanMessage({
      id: uuidv4(),
      content: summaryMessage,
    }),
  ];

  const response = await model.invoke(allMessages);

  // Keep the last 2 messages (recent context) and remove older ones
  const deleteMessages = messages
    .slice(0, -2)
    .filter((m) => typeof m.id === "string")
    .map((m) => new RemoveMessage({ id: m.id as string }));

  if (typeof response.content !== "string") {
    throw new Error("Expected a string response from the model");
  }

  return {
    summary: response.content,
    messages: deleteMessages,
    userId: userId,
    selectedFileIds: selectedFileIds,
  };
}

// Build the graph
const workflow = new StateGraph(GraphAnnotation)
  .addNode("conversation", callModel)
  .addNode("tools", toolNode)
  .addNode("summarize_conversation", summarizeConversation)
  .addEdge(START, "conversation")
  .addConditionalEdges("conversation", conversationCondition, {
    tools: "tools",
    summarize_conversation: "summarize_conversation",
    __end__: END,
  })
  .addEdge("tools", "conversation")
  .addEdge("summarize_conversation", END);

// Compile the graph with memory
export const appGraph = workflow.compile({ checkpointer: memory });

// Keep the old export for backward compatibility
export { appGraph as graph, GraphAnnotation };
