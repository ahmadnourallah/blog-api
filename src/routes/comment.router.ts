import { Router } from "express";
import { validateQueries, validateComment } from "../utils/validation";
import { isAuthenticated } from "../middleware/auth.middleware";
import commentController from "../controllers/comment.controller";

const router = Router();

router.get("/", validateQueries(), commentController.getComments);

router.post(
	"/",
	isAuthenticated,
	validateComment(),
	commentController.createComment
);

export default router;
