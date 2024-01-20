import { Router } from "express";
import {
	getCourseList,
	getCourseContent,
	getCourseInfo,
} from "../controllers/course.mjs";
import authMiddleware from "../middlewares/auth.mjs";

const router = new Router();

router.get("/list", authMiddleware, getCourseList);
router.get("/:id/content", authMiddleware, getCourseContent);
router.get("/:id", authMiddleware, getCourseInfo);

export default router;
