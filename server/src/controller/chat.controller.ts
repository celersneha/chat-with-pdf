import { getAuth } from "@clerk/express";
import vectorStore from "../lib/vectorStore";
import client from "../lib/client";

export const chat = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    const userQuery = req.query.message as string;

    if (!userQuery) {
      return res.status(400).json({ error: "Message parameter is required" });
    }

    let filter: {} = {};
    if (userId) {
      filter = {
        must: [
          {
            key: "metadata.userId",
            match: { value: userId },
          },
        ],
      };
    }

    const similarData = await vectorStore.similaritySearch(
      userQuery,
      5,
      filter
    );

    const pageContents = similarData.map((doc) => doc.pageContent);
    const contextText = pageContents.join("\n---\n");

    const SYSTEM_PROMPT = `You are helpfull AI Assistant who answers the user query based on the available pdf file Context: ${contextText}
    Don't add any styling such as bold, italics, or lists. Mention the entire content which is retrieved.
    `;

    const chatResult = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });

    const aiContent = chatResult?.choices[0]?.message.content;
    let aiContentPreview: string;
    if (typeof aiContent === "string") {
      aiContentPreview = aiContent.substring(0, 100) + "...";
    } else if (Array.isArray(aiContent)) {
      aiContentPreview = "[ContentChunk[] response]";
    } else {
      aiContentPreview = "[Unknown response type]";
    }

    return res.json({
      message: chatResult?.choices[0]?.message.content,
      docs: similarData,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
