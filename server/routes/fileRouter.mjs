import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import { get } from "../controllers/file.mjs";

const router = new Router();

router.get("/:id", authMiddleware, get);

export default router;
