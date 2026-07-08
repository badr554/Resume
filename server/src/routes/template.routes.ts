import { Router } from "express";
import * as template from "../controllers/template.controller";

const router = Router();

router.get("/", template.list);

export default router;
