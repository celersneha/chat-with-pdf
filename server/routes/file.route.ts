import { requireAuth } from "@clerk/express";
import { uploadFile } from "../controller/file.controller";
import { Router } from "express";
import upload from "../lib/multerStorage";

const router = Router();

router.route("/upload").post(requireAuth(), upload.single("pdf"), uploadFile);

export default router;
