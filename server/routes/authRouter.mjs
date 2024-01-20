import { Router } from "express";
import { login, register, info } from "../controllers/auth.mjs";
import authMiddleware from "../middlewares/auth.mjs";

const router = new Router();

router.post("/login", login);
router.post("/register", register);
router.get("/info", authMiddleware, info);

export default router;
