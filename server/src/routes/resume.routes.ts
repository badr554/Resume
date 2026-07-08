import { Router } from "express";
import { body, param } from "express-validator";
import * as resume from "../controllers/resume.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.use(requireAuth);

const idParam = param("id").isUUID().withMessage("Invalid resume id");

router.get("/", resume.list);

router.post(
  "/",
  [
    body("title").optional().isString().trim().isLength({ min: 1, max: 120 }),
    body("templateId").optional().isString().trim().isIn(["modern", "classic", "minimal", "ats-safe"]),
    body("content").optional().isObject(),
  ],
  validate,
  resume.create
);

router.get("/:id", [idParam], validate, resume.getOne);

router.put(
  "/:id",
  [
    idParam,
    body("title").optional().isString().trim().isLength({ min: 1, max: 120 }),
    body("templateId").optional().isString().trim().isIn(["modern", "classic", "minimal", "ats-safe"]),
    body("content").optional().isObject(),
    body("atsScore").optional().isInt({ min: 0, max: 100 }),
  ],
  validate,
  resume.update
);

router.delete("/:id", [idParam], validate, resume.remove);
router.post("/:id/duplicate", [idParam], validate, resume.duplicate);
router.get("/:id/pdf", [idParam], validate, resume.downloadPdf);

export default router;
