import { Router } from "express";
import { body } from "express-validator";
import * as auth from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
    body("password").isString().isLength({ min: 8, max: 128 }).withMessage("Password must be at least 8 characters"),
  ],
  validate,
  auth.register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  validate,
  auth.login
);

router.post("/refresh", auth.refresh);
router.post("/logout", auth.logout);
router.get("/me", requireAuth, auth.me);

router.put(
  "/profile",
  requireAuth,
  [
    body("name").isString().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters"),
    body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
  ],
  validate,
  auth.updateProfile
);

router.put(
  "/password",
  requireAuth,
  [
    body("currentPassword").isString().notEmpty().withMessage("Current password is required"),
    body("newPassword").isString().isLength({ min: 8, max: 128 }).withMessage("New password must be at least 8 characters"),
  ],
  validate,
  auth.changePassword
);

router.delete("/account", requireAuth, auth.deleteAccount);

export default router;
