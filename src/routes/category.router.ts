import { Router } from "express";
import {
	validateQueries,
	validateCategory,
	validateCategoryId,
} from "../utils/validation";
import categoryController from "../controllers/category.controller";

const router = Router();

router.get(
	"/:categoryId",
	validateCategoryId(),
	categoryController.getCategory
);
router.get("/", validateQueries(), categoryController.getCategories);
router.get("/", validateQueries(), categoryController.getCategories);
router.post("/", validateCategory(), categoryController.createCategory);

export default router;
