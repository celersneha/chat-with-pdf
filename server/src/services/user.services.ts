import { db } from "../db";
import { users } from "../db/schema/user.schema.js";
import { eq } from "drizzle-orm";

export const getUserById = async (userId: string) => {
  const user = await db.select().from(users).where(eq(users.userid, userId));
  return user[0] || null;
};

export const canUploadFile = (user: any) => {
  return (user?.uploadedFileCount ?? 0) < 5;
};
