import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import { validateQueries, validateUserId } from "../utils/validation";
import userController from "../controllers/user.controller";

const router = Router();

router.get(
	"/:userId",
	isAuthenticated,
	isAdmin,
	validateQueries(),
	validateUserId(),
	userController.getUser
);

router.get(
	"/",
	isAuthenticated,
	isAdmin,
	validateQueries(),
	userController.getUsers
);

export default router;
