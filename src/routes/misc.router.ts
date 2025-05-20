import { Router } from "express";
import miscController from "../controllers/misc.controller";

const router = Router();

router.all("/*splat", miscController.notFound);

export default router;
