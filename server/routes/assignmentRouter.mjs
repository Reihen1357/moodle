import { Router } from "express";
import authMiddleware from "../middlewares/auth.mjs";
import {
	addComment,
	deleteAnswer,
	deleteComment,
	getById,
	saveAnswer,
	editAnswer,
} from "../controllers/assignment.mjs";

const router = new Router();

router.get("/:id", authMiddleware, getById);
router.post("/:id/add-comment", authMiddleware, addComment);
router.delete("/:id/remove-comment/:commentId", authMiddleware, deleteComment);
router.post("/:id/save-answer", authMiddleware, saveAnswer);
router.put("/:id/edit-answer", authMiddleware, editAnswer);
router.delete("/:id/delete-answer", authMiddleware, deleteAnswer);

export default router;
