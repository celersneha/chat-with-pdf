import { requireAuth } from "@clerk/express";
import { chat } from "../controller/chat.controller";
import { Router } from "express";

const router = Router();

router.route("/chat-with-pdf").get(requireAuth(), chat);

export default router;
