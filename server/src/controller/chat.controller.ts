import { getAuth } from "@clerk/express";
import { appGraph } from "../lib/chatMemory.js";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string(),
  fileIds: z.array(z.string()),
  sessionId: z.string().uuid(),
});

export const chat = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    // Validate request data
    const parsedData = chatRequestSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        error: "Invalid request format",
        details: parsedData.error.errors,
      });
    }

    const { message, fileIds, sessionId } = parsedData.data;

    if (fileIds.length === 0) {
      return res.status(400).json({
        error: "At least one file must be selected",
      });
    }

    const inputMessage = new HumanMessage(message);

    const config = {
      configurable: { thread_id: sessionId },
    };

    // Initial state for the graph
    const initialState = {
      messages: [inputMessage],
      userId: userId,
      selectedFileIds: fileIds,
    };

    const result = await appGraph.invoke(initialState, config);

    // console.log("Chat response from appGraph:", result);

    // Find the last AI message
    let aiResponse = null;
    if (Array.isArray(result.messages)) {
      const aiMsg = result.messages.findLast(
        (msg: any) =>
          msg._getType?.() === "ai" && typeof msg.content === "string"
      );
      if (aiMsg) {
        aiResponse = {
          type: "ai",
          content: aiMsg.content,
        };
      }
    }

    // console.log("AI Chat response:", aiResponse);

    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        threadId: sessionId,
        summary: result.summary || "",
      },
      message: aiResponse?.content,
    });
  } catch (error) {
    console.error("Chat controller error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
