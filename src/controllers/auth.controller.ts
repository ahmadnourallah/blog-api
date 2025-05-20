import { Request, Response } from "express";
import { PrismaClient, User } from "../prisma/src/db/index";
import { issueJWT } from "../utils/crypto";
import { ClientError } from "../middleware/error.middleware";
import { validateResults } from "../utils/validation";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

const register = async (req: Request, res: Response) => {
	const { name, email, password } = validateResults(req);

	const hashedPassword = await bcryptjs.hash(password, 10);

	const user = await prisma.user.create({
		data: { name, email, password: hashedPassword },
		select: { id: true, name: true, email: true, role: true },
	});

	const token = issueJWT(user);

	res.json({ status: "success", data: { user, token } });
};

const login = async (req: Request, res: Response) => {
	const { email, password } = validateResults(req);

	const user = await prisma.user.findUnique({
		where: { email },
		select: { id: true, name: true, email: true, role: true },
	});
	const doesMatch = bcryptjs.compare(user?.password || "", password);

	if (!user || !doesMatch)
		throw new ClientError({ user: "Wrong email or password" }, 401);

	const token = issueJWT(user);

	res.json({ status: "success", data: { user, token } });
};

export default { register, login };
