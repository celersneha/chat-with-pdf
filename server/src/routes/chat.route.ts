import { requireAuth } from "@clerk/express";
import { chat } from "../controller/chat.controller.js";
import { Router } from "express";

const router = Router();

router.route("/chat-with-pdf").post(requireAuth(), chat);

export default router;
