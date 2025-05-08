import { Router } from "express";
import { validateQueries, validateCategory } from "../utils/validation";
import categoryController from "../controllers/category.controller";

const router = Router();

router.get("/", validateQueries(), categoryController.getCategories);
router.post("/", validateCategory(), categoryController.createCategory);

export default router;
