import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import { get, save } from "../controllers/file.mjs";

const router = new Router();

router.get("/:id", authMiddleware, get);
router.post("/save", save);

export default router;
