import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../config/swagger.config";
import miscController from "../controllers/misc.controller";

const router = Router();

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
router.all("/*splat", miscController.notFound);

export default router;
