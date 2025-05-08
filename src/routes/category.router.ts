import { Router } from "express";
import {
	validateQueries,
	validateCategory,
	validateCategoryId,
} from "../utils/validation";
import categoryController from "../controllers/category.controller";
import { isAdmin, isAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.get(
	"/:categoryId",
	validateCategoryId(),
	categoryController.getCategory
);
router.put(
	"/:categoryId",
	isAuthenticated,
	isAdmin,
	validateCategoryId(),
	validateCategory(true),
	categoryController.updateCategory
);
router.get("/", validateQueries(), categoryController.getCategories);
router.get("/", validateQueries(), categoryController.getCategories);
router.post(
	"/",
	isAuthenticated,
	isAdmin,
	validateCategory(),
	categoryController.createCategory
);

export default router;
