import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import {
	validateQueries,
	validatePost,
	validatePostId,
} from "../utils/validation";
import postController from "../controllers/post.controller";

const router = Router();

router.get("/:postId", validatePostId(), postController.getPost);

router.put(
	"/:postId",
	isAuthenticated,
	isAdmin,
	validatePostId(),
	validatePost(true),
	postController.updatePost
);

router.delete(
	"/:postId",
	isAuthenticated,
	isAdmin,
	validatePostId(),
	postController.deletePost
);

router.get(
	"/:postId/comments",
	validatePostId(),
	validateQueries(),
	postController.getPostComments
);

router.post(
	"/",
	isAuthenticated,
	isAdmin,
	validatePost(),
	postController.createPost
);

router.get("/", validateQueries(), postController.getPosts);

export default router;
