import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";
import { validateQueries } from "../utils/validation";
import userController from "../controllers/user.controller";

const router = Router();

router.get(
	"/",
	isAuthenticated,
	isAdmin,
	validateQueries(),
	userController.getUsers
);

export default router;
