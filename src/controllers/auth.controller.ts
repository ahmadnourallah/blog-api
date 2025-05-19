import { Request, Response } from "express";
import { body } from "express-validator";
import { PrismaClient, User } from "../prisma/src/db/index";
import { issueJWT } from "../utils/crypto";
import { AppError } from "../middleware/error.middleware";
import { validateResults } from "../utils/validation";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

const validateRegister = () => [
	body("name").trim().escape().notEmpty().withMessage("Name cannot be empty"),
	body("email")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Email cannot be empty")
		.isEmail()
		.withMessage("Email must be valid"),
	body("password")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Password cannot be empty")
		.isLength({ min: 8, max: 16 })
		.withMessage("Password must be between 8-16 characters")
		.matches("[0-9]")
		.withMessage("Password must contain a number")
		.matches("(?=.*?[#@$?])")
		.withMessage("Password must contain a special character"),
];

const validateLogin = () => [
	body("email").trim().notEmpty().withMessage("Email cannot be empty"),
	body("password").trim().notEmpty().withMessage("Password cannot be empty"),
];

const register = async (req: Request, res: Response) => {
	validateResults(req);

	const { name, email, password } = req.body;

	const userExists = await prisma.user.findUnique({ where: { email } });
	if (userExists) throw new AppError(409, "Email already exists");

	const hashedPassword = await bcryptjs.hash(password, 10);

	const user = await prisma.user.create({
		data: { name, email, password: hashedPassword },
		select: { id: true, name: true, email: true, role: true },
	});

	const token = issueJWT(user);

	res.json({ status: "success", data: { user, token } });
};

const login = async (req: Request, res: Response) => {
	validateResults(req);

	const { email, password } = req.body;

	const user = await prisma.user.findUnique({
		where: { email },
		select: { id: true, name: true, email: true, role: true },
	});
	const doesMatch = bcryptjs.compare(user?.password || "", password);

	if (!user || !doesMatch) throw new AppError(401, "Wrong email or password");

	const token = issueJWT(user);

	res.json({ status: "success", data: { user, token } });
};

export default {
	validateRegister,
	validateLogin,
	register,
	login,
};
