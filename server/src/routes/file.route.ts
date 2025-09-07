import { requireAuth } from "@clerk/express";
import {
  uploadFile,
  getFilesOfCurrentUser,
  deleteFile,
} from "../controller/file.controller";
import { Router } from "express";
import upload from "../utils/multerStorage";

const router = Router();

router.route("/upload").post(requireAuth(), upload.single("pdf"), uploadFile);
router.route("/get-files").get(requireAuth(), getFilesOfCurrentUser);
router.route("/delete-file/:fileId").delete(requireAuth(), deleteFile);

export default router;
