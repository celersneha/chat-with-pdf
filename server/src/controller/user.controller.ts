import express from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/user.schema";

export const registerUser = async (req: any, res: any) => {
  try {
    const { userId, email, firstName } = req.body;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.userid, userId));

    if (existing.length > 0) {
      return res.status(200).json({ message: "User already exists" });
    }

    await db
      .insert(users)
      .values({
        userid: userId,
        email,
        firstName,
      })
      .returning();

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).json({ error: "Internal server error", details: err });
  }
};
