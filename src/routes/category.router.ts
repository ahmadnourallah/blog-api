import { Router } from "express";
import { validateQueries } from "../utils/validation";
import categoryController from "../controllers/category.controller";

const router = Router();

router.get("/", validateQueries(), categoryController.getCategories);

export default router;
