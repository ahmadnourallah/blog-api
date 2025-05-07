import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import postController from "../controllers/post.controller";

const router = Router();

router.post(
	"/",
	isAuthenticated,
	isAdmin,
	postController.validatePost(),
	postController.createPost
);

router.put(
	"/:postId",
	isAuthenticated,
	isAdmin,
	postController.validatePost(true),
	postController.updatePost
);

export default router;
