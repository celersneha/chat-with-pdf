import { requireAuth } from "@clerk/express";
import {
  uploadFile,
  getFilesOfCurrentUser,
  deleteFile,
  processFileReady,
  processDeleteVectorDocs,
} from "../controller/file.controller.js";
import { Router } from "express";
import upload from "../utils/multerStorage.js";

const router = Router();

router.route("/upload").post(requireAuth(), upload.single("pdf"), uploadFile);
router.route("/get-files").get(requireAuth(), getFilesOfCurrentUser);
router.route("/delete-file/:fileId").delete(requireAuth(), deleteFile);

//production
router.route("/delete-vector-docs/:fileId").post(processDeleteVectorDocs);
router.route("/process-file-ready").post(processFileReady);

export default router;
