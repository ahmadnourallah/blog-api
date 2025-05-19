import { Router } from "express";
import { validateRegister, validateLogin } from "../utils/validation";
import authController from "../controllers/auth.controller";

const router = Router();

router.post("/register", validateRegister(), authController.register);
router.post("/login", validateLogin(), authController.login);

export default router;
