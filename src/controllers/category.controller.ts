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

const getCategoryPosts = async (req: Request, res: Response) => {
	const { start, end, search, order, orderBy, categoryId } =
		validateResults(req);

	const posts = await prisma.post.findMany({
		where: {
			categories: {
				some: {
					id: categoryId,
				},
			},
			OR: [
				{ title: { contains: search } },
				{ content: { contains: search } },
			],
		},
		skip: start,
		take: end - start,
		orderBy: {
			[orderBy === "title" ? "title" : "createdAt"]: order,
		},
		include: {
			author: { select: { name: true, email: true, bio: true } },
			categories: { select: { id: true, name: true } },
		},
	});

	res.status(200).send({ count: posts.length, data: posts });
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

const updateCategory = async (req: Request, res: Response) => {
	const { categoryId, name, posts } = validateResults(req);

	let newPosts;
	let excludedPosts;

	if (posts) {
		newPosts = posts.map((post: string) => {
			return { title: post };
		});

		const category = await prisma.category.findUnique({
			where: { id: categoryId },
			select: { posts: { select: { title: true } } },
		});

		excludedPosts = category?.posts.filter(
			(post) => !posts.includes(post.title)
		);
	}

	const category = await prisma.category.update({
		where: {
			id: categoryId,
		},
		data: {
			name,
			posts: {
				connect: newPosts,
				disconnect: excludedPosts,
			},
		},
		include: {
			_count: { select: { posts: true } },
		},
	});

	res.status(201).send({
		data: {
			id: category?.id,
			name: category?.name,
			createdAt: category?.createdAt,
			postCount: category?._count.posts,
		},
	});
};

const deleteCategory = async (req: Request, res: Response) => {
	const { categoryId } = validateResults(req);

	await prisma.category.delete({ where: { id: categoryId } });

	res.status(201).json({ success: true, data: {} });
};

export default {
	getCategories,
	getCategory,
	getCategoryPosts,
	createCategory,
	updateCategory,
	deleteCategory,
};
