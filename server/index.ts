import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import fileRoutes from "./routes/file.route";
import chatRoutes from "./routes/chat.route";

// Extend Express Request type to include 'auth'
declare global {
  namespace Express {
    interface Request {
      auth?: any;
    }
  }
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the backend API!" });
});

app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);

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
