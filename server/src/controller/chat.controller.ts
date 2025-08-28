import { getAuth } from "@clerk/express";
import vectorStore from "../lib/vectorStore";
import client from "../lib/client";

export const chat = async (req: any, res: any) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    const userQuery = req.body.message as string;
    const fileIds = req.body.fileIds as string[];

    if (!userQuery) {
      return res.status(400).json({ error: "Message parameter is required" });
    }
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one file must be selected" });
    }

    // Filter: userId + fileIds
    const filter = {
      must: [
        { key: "metadata.userId", match: { value: userId } },
        { key: "metadata.fileId", match: { any: fileIds } },
      ],
    };

    const similarData = await vectorStore.similaritySearch(
      userQuery,
      8,
      filter
    );

    const pageContents = similarData.map((doc) => doc.pageContent);
    const contextText = pageContents.join("\n---\n");

    const SYSTEM_PROMPT = `You are helpfull AI Assistant who answers the user query based on the available pdf file Context: ${contextText}. Mention the entire content which is retrieved. Give a summarized content if the answer is very much long.
    `;

    const chatResult = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });

    return res.json({
      message: chatResult?.choices[0]?.message.content,
      docs: similarData,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
