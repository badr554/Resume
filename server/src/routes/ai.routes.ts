import { Router } from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import multer from "multer";
import * as ai from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? "anonymous",
  message: { message: "AI rate limit reached — try again in an hour" },
});

router.use(requireAuth, aiLimiter);

router.post(
  "/generate",
  [
    body("jobTitle").isString().trim().isLength({ min: 2, max: 200 }).withMessage("Job title is required"),
    body("jobDescription").isString().trim().isLength({ min: 20 }).withMessage("Job description is too short"),
    body("existingData").optional().isObject(),
  ],
  validate,
  ai.generate
);

router.post(
  "/improve-section",
  [
    body("section").isString().trim().isLength({ min: 1, max: 100 }).withMessage("Section is required"),
    body("content").isString().trim().isLength({ min: 1 }).withMessage("Content is required"),
    body("jobDescription").isString().trim().isLength({ min: 1 }).withMessage("Job description is required"),
  ],
  validate,
  ai.improveSection
);

router.post(
  "/ats-check",
  [
    body("resumeContent").isObject().withMessage("Resume content is required"),
    body("jobDescription").isString().trim().isLength({ min: 20 }).withMessage("Job description is too short"),
  ],
  validate,
  ai.atsCheck
);

router.post(
  "/cover-letter",
  [
    body("resumeContent").isObject().withMessage("Resume content is required"),
    body("jobTitle").isString().trim().isLength({ min: 2, max: 200 }).withMessage("Job title is required"),
    body("jobDescription").isString().trim().isLength({ min: 20 }).withMessage("Job description is too short"),
    body("companyName").isString().trim().isLength({ min: 1, max: 200 }).withMessage("Company name is required"),
  ],
  validate,
  ai.coverLetter
);

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});

router.post(
  "/ats-check-file",
  upload.single("file"),
  [
    body("jobDescription").isString().trim().isLength({ min: 20 }).withMessage("Job description is too short"),
  ],
  validate,
  ai.atsCheckFile
);

export default router;
