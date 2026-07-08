import { Router } from "express";
import { body, param } from "express-validator";
import * as coverLetter from "../controllers/cover-letter.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(requireAuth);

const idParam = param("id").isUUID().withMessage("Invalid cover letter id");

router.get("/", coverLetter.list);

router.post(
  "/",
  [
    body("title").isString().trim().isLength({ min: 1, max: 120 }).withMessage("Title is required"),
    body("content").isString().trim().isLength({ min: 1 }).withMessage("Content is required"),
  ],
  validate,
  coverLetter.create
);

router.put(
  "/:id",
  [
    idParam,
    body("title").optional().isString().trim().isLength({ min: 1, max: 120 }),
    body("content").optional().isString().trim().isLength({ min: 1 }),
  ],
  validate,
  coverLetter.update
);

router.delete("/:id", [idParam], validate, coverLetter.remove);
router.get("/:id/pdf", [idParam], validate, coverLetter.downloadPdf);

export default router;
