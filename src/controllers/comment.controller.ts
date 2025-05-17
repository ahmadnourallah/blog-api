import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { validateResults } from "../utils/validation";

const prisma = new PrismaClient();

const getComments = async (req: Request, res: Response) => {
	const { start, end, search, order } = validateResults(req);

	const comments = await prisma.comment.findMany({
		where: {
			content: { contains: search },
		},
		skip: start,
		take: end - start,
		orderBy: {
			createdAt: order,
		},
	});

	res.status(200).send({ count: comments.length, data: comments });
};

export default {
	getComments,
};
