import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { validateResults } from "../utils/validation";
import { issueJWT } from "../utils/crypto";
import { ClientError } from "../middleware/error.middleware";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

const getUsers = async (req: Request, res: Response) => {
	const { start, end, search, order } = validateResults(req);

	const users = await prisma.user.findMany({
		where: {
			name: { contains: search },
		},
		skip: start,
		take: end - start,
		orderBy: {
			name: order,
		},
		select: { id: true, name: true, email: true, role: true, bio: true },
	});

	res.status(200).send({
		status: "success",
		data: { count: users.length, users },
	});
};

const getUser = async (req: Request, res: Response) => {
	const { userId } = validateResults(req);

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, name: true, email: true, role: true, bio: true },
	});

	res.status(200).send({ status: "success", data: { user } });
};

const updateUserRole = async (req: Request, res: Response) => {
	const { userId, role } = validateResults(req);

	const user = await prisma.user.update({
		where: { id: userId },
		data: { role },
		select: { id: true, name: true, email: true, role: true },
	});

	res.status(201).send({ status: "success", data: { user } });
};

const createUser = async (req: Request, res: Response) => {
	const { name, email, password } = validateResults(req);

	const hashedPassword = await bcryptjs.hash(password, 10);

	const user = await prisma.user.create({
		data: { name, email, password: hashedPassword },
		select: { id: true, name: true, email: true, role: true },
	});

	const token = issueJWT(user);

	res.json({ status: "success", data: { user, token } });
};

const deleteUser = async (req: Request, res: Response) => {
	const { userId } = validateResults(req);

	await prisma.user.delete({ where: { id: userId } });

	res.status(201).json({ status: "success", data: null });
};

const authenticate = async (req: Request, res: Response) => {
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

export default {
	getUsers,
	getUser,
	updateUserRole,
	createUser,
	deleteUser,
	authenticate,
};
