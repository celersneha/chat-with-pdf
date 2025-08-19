import { clerkClient, getAuth } from "@clerk/express";
import queue from "../lib/queue";
import fs from "fs";
import vectorStore from "../lib/vectorStore";

export const uploadFile = async (req: any, res: any) => {
  try {
    console.log("hitting endpoint");
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: userId not found" });
    }

    const user = await clerkClient.users.getUser(userId);

    const jobData = {
      action: "upload",
      filename: req.file?.originalname,
      destination: req.file?.destination,
      path: req.file?.path,
      fileId: `${userId}-${Date.now()}`,
      fileName: req.file?.originalname,
      userId: userId,
    };
    console.log("Job data:", jobData);
    await queue.add("file-ready", JSON.stringify(jobData));

    // if (req.file?.path) {
    //   fs.unlink(req.file.path, (err: any) => {
    //     if (err) {
    //       console.error("File delete error:", err);
    //     } else {
    //       console.log("File deleted from uploads:", req?.file?.path);
    //     }
    //   });
    // }

    res.json({ message: "File uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getFilesOfCurrentUser = async (req: any, res: any) => {
//   const { userId } = getAuth(req);

//   if (!userId) {
//     return res.status(401).json({ error: "Unauthorized: userId not found" });
//   }

//   const files =  await vectorStore.

// };
