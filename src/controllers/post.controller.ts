import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db/index";
import { validateResults } from "../utils/validation";

const prisma = new PrismaClient();

const getPosts = async (req: Request, res: Response) => {
	const { start, end, search, orderBy, order } = validateResults(req);

	const posts = await prisma.post.findMany({
		where: {
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
			categories: true,
		},
	});

	res.status(200).send({ count: posts.length, data: posts });
};

const getPost = async (req: Request, res: Response) => {
	const { postId } = validateResults(req);

	const post = await prisma.post.findUnique({
		where: { id: postId },
		include: {
			author: { select: { name: true, email: true, bio: true } },
			categories: true,
			comments: true,
		},
	});

	res.status(200).send({ data: post });
};

const createPost = async (req: Request, res: Response) => {
	const { title, content, authorId, categories } = validateResults(req);

	const newCategories =
		categories &&
		categories.map((category: string) => {
			return {
				where: { name: category },
				create: { name: category },
			};
		});

	const post = await prisma.post.create({
		data: {
			title,
			content,
			authorId,
			categories: {
				connectOrCreate: newCategories,
			},
		},

		include: {
			author: { select: { name: true, email: true, bio: true } },
			categories: true,
		},
	});

	res.status(201).json({ success: true, data: post });
};

const updatePost = async (req: Request, res: Response) => {
	const { postId, title, content, authorId, categories } =
		validateResults(req);

	let newCategories;
	let excludedCategories;

	if (categories) {
		newCategories = categories.map((category: string) => {
			return {
				where: { name: category },
				create: { name: category },
			};
		});

		const post = await prisma.post.findUnique({
			where: { id: postId },
			select: { categories: { select: { name: true } } },
		});

		excludedCategories = post?.categories.filter(
			(category) => !categories.includes(category.name)
		);
	}

	const post = await prisma.post.update({
		where: {
			id: postId,
		},
		data: {
			title,
			content,
			authorId,
			categories: {
				connectOrCreate: newCategories,
				disconnect: excludedCategories,
			},
		},

		include: {
			author: { select: { name: true, email: true, bio: true } },
			categories: true,
		},
	});

	res.status(201).json({ success: true, data: post });
};

const deletePost = async (req: Request, res: Response) => {
	const { postId } = validateResults(req);

	await prisma.post.delete({ where: { id: postId } });

	res.status(201).json({ success: true, data: {} });
};

export default { getPosts, getPost, createPost, updatePost, deletePost };
