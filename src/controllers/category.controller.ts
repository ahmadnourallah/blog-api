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

const getCategory = async (req: Request, res: Response) => {
	const { categoryId } = validateResults(req);

	const category = await prisma.category.findUnique({
		where: { id: categoryId },
		include: {
			_count: { select: { posts: true } },
		},
	});

	res.status(200).send({
		data: {
			id: category?.id,
			name: category?.name,
			createdAt: category?.createdAt,
			postCount: category?._count.posts,
		},
	});
};

const createCategory = async (req: Request, res: Response) => {
	const { name, posts } = validateResults(req);

	const newPosts =
		posts &&
		posts.map((post: string) => {
			return { title: post };
		});

	const category = await prisma.category.create({
		data: {
			name,
			posts: {
				connect: newPosts,
			},
		},
	});

	res.status(201).json({ success: true, data: category });
};

export default {
	getCategories,
	getCategory,
	createCategory,
};
