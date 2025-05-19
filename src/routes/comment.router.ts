import { Router } from "express";
import {
	validateQueries,
	validateComment,
	validateCommentId,
} from "../utils/validation";
import { isAuthenticated } from "../middleware/auth.middleware";
import commentController from "../controllers/comment.controller";

const router = Router();

router.get("/:commentId", validateCommentId(), commentController.getComment);

router.put(
	"/:commentId",
	isAuthenticated,
	validateCommentId(true),
	validateComment(),
	commentController.updateComment
);

router.delete(
	"/:commentId",
	isAuthenticated,
	validateCommentId(true),
	commentController.deleteComment
);

router.get("/", validateQueries(), commentController.getComments);

router.post(
	"/",
	isAuthenticated,
	validateComment(),
	commentController.createComment
);

export default router;
