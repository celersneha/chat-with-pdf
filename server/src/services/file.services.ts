import { db } from "../db";
import { users } from "../db/schema/user.schema";
import { getUserById } from "./user.services";
import { eq } from "drizzle-orm";
import queue from "../lib/queue"; // Apne queue ka import path sahi karein

export const deleteFile = async (userId: any, fileId: any) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (Array.isArray(user.files)) {
    user.files = user.files.filter((file: any) => file.fileId !== fileId);
  } else {
    user.files = [];
  }

  const files = user.files as Array<{ fileId: any }>;

  const updatedUser = await db
    .update(users)
    .set({ files: files, uploadedFileCount: files.length })
    .where(eq(users.userid, userId))
    .returning();

  await queue.add(
    "delete-vector-docs",
    JSON.stringify({
      userId,
      fileId,
    })
  );
};

export const updateDBWithUploadedFile = async (
  userId: string,
  fileName: string,
  fileId: string
) => {
  const user = await getUserById(userId);
  const newFile = { fileName, fileId };
  const updatedFiles = Array.isArray(user?.files)
    ? [...user.files, newFile]
    : [newFile];
  const updatedFileCount = (user?.uploadedFileCount ?? 0) + 1;

  await db
    .update(users)
    .set({
      uploadedFileCount: updatedFileCount,
      files: updatedFiles,
    })
    .where(eq(users.userid, userId));
};
