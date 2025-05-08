import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db";
import { validateResults } from "../utils/validation";

const prisma = new PrismaClient();

const getCategories = async (req: Request, res: Response) => {
	const { start, end, search, orderBy, order } = validateResults(req);

	const categories = await prisma.category.findMany({
		where: {
			name: { contains: search },
		},
		skip: start,
		take: end - start,
		orderBy: {
			[orderBy === "title" ? "name" : "createdAt"]: order,
		},
	});

	res.status(200).send({ count: categories.length, data: categories });
};

export default {
	getCategories,
};
