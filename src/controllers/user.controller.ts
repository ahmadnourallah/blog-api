import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { validateResults } from "../utils/validation";

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
		select: { id: true, name: true, email: true, bio: true },
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
		select: { id: true, name: true, email: true, bio: true },
	});

	res.status(200).send({ status: "success", data: { user } });
};

export default { getUsers, getUser };
