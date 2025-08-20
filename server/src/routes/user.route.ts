import { requireAuth } from "@clerk/express";
import { registerUser } from "../controller/user.controller";
import { Router } from "express";

const router = Router();

router.route("/register-user").post(registerUser);

export default router;
