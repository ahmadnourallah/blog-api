import { Router } from "express";
import { validateUser, validateLogin } from "../utils/validation";
import authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", validateUser(), authController.register);
router.post("/login", validateLogin(), authController.login);

export default router;
