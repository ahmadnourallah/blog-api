import { Router } from "express";
import { validateQueries } from "../utils/validation";
import commentController from "../controllers/comment.controller";

const router = Router();

router.get("/", validateQueries(), commentController.getComments);

export default router;
