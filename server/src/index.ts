import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import fileRoutes from "../src/routes/file.route";
import chatRoutes from "../src/routes/chat.route";
import userRoutes from "../src/routes/user.route";

// Extend Express Request type to include 'auth'
declare global {
  namespace Express {
    interface Request {
      auth?: any;
    }
  }
}

const app = express();

app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the backend API!" });
});

app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user", userRoutes);

// Add error handling middleware
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.status(500).json({ error: "Something went wrong!" });
  }
);

app.listen(8000, () => {
  console.log("🚀 Server is running on http://localhost:8000");
});

export default app;
