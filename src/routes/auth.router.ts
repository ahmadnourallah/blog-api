import { Router } from "express";
import authController from "../controllers/auth.controller";

const router = Router();

router.post(
	"/register",
	authController.validateRegister(),
	authController.register
);
router.post("/login", authController.validateLogin(), authController.login);

export default router;
