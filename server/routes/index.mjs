import { Router } from "express";
import authRouter from "./authRouter.mjs";
import courseRouter from "./courseRouter.mjs";
import categoriesRouter from "./categoriesRouter.mjs";
import assignmentRouter from "./assignmentRouter.mjs";
import fileRouter from "./fileRouter.mjs";

export const router = new Router();

router.use("/auth", authRouter);
router.use("/course", courseRouter);
router.use("/category", categoriesRouter);
router.use("/assignment", assignmentRouter);
router.use("/file", fileRouter);
