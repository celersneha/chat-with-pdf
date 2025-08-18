import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
