import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import aiRoutes from "./routes/ai.routes";
import authRoutes from "./routes/auth.routes";
import coverLetterRoutes from "./routes/cover-letter.routes";
import resumeRoutes from "./routes/resume.routes";
import templateRoutes from "./routes/template.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/cover-letters", coverLetterRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`ResumeAI server listening on http://localhost:${port}`);
});
