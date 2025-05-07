import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import { validateQueries } from "../utils/validation";
import postController from "../controllers/post.controller";

const router = Router();

router.post(
	"/",
	isAuthenticated,
	isAdmin,
	postController.validatePost(),
	postController.createPost
);

router.get("/", validateQueries(), postController.getPosts);

router.put(
	"/:postId",
	isAuthenticated,
	isAdmin,
	postController.validatePost(true),
	postController.updatePost
);

export default router;
