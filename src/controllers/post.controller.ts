import { Request, Response } from "express";
import { PrismaClient } from "../prisma/src/db/index";
import { body, param, matchedData } from "express-validator";
import { validateResults } from "../utils/validation";

const prisma = new PrismaClient();

const validatePost = (validateId = false) => {
	const chain = [
		body("title")
			.trim()
			.escape()
			.notEmpty()
			.withMessage("Tile cannot be empty")
			.isString()
			.withMessage("Title must be a string")
			.custom(async (title, { req }) => {
				const postExists = await prisma.post.findFirst({
					where: { id: { not: req?.params?.postId }, title },
				});

				if (postExists) throw new Error("Title must be unique");
			}),
		body("content")
			.trim()
			.escape()
			.notEmpty()
			.withMessage("Content cannot be empty")
			.isString()
			.withMessage("Content must be a string"),
		body("authorId")
			.trim()
			.escape()
			.notEmpty()
			.withMessage("Author's id cannot be empty")
			.bail()
			.toInt()
			.isNumeric()
			.withMessage("Author's id must be a number")
			.bail()
			.custom(async (authorId) => {
				const userExists = await prisma.user.findUnique({
					where: { id: authorId },
				});

				if (!userExists) throw new Error("Author does not exist");
			}),
		body("categories")
			.trim()
			.escape()
			.optional()
			.toArray()
			.isArray()
			.withMessage("Categories must be an array"),
	];

	if (validateId) {
		chain.unshift(
			param("postId")
				.trim()
				.escape()
				.notEmpty()
				.withMessage("Post's id cannot be empty")
				.bail()
				.toInt()
				.isNumeric()
				.withMessage("Post's id must be a number")
				.bail()
				.custom(async (postId) => {
					const postExists = await prisma.post.findUnique({
						where: { id: postId },
					});

					if (!postExists) throw new Error("Post does not exist");
				})
		);
	}

	return chain;
};

const createPost = async (req: Request, res: Response) => {
	validateResults(req);

	const { title, content, authorId, categories } = matchedData(req);

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
	validateResults(req);

	const { postId, title, content, authorId, categories } = matchedData(req);

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

export default { validatePost, createPost, updatePost };
