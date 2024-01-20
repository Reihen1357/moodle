import { Router } from "express";
import { getCategories } from "../controllers/categories.mjs";

const router = new Router();

router.get("/list", getCategories);

export default router;
