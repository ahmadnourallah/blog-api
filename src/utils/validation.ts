import { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/error.middleware";
import {
	validationResult,
	query,
	param,
	body,
	matchedData,
} from "express-validator";
import { PrismaClient } from "../prisma/src/db/index";

const prisma = new PrismaClient();

const validateQueries = () => [
	query("start")
		.default(0)
		.toInt()
		.isNumeric()
		.isLength({ min: 0 })
		.withMessage("Start must be a number")
		.withMessage("Start cannot be negative")
		.customSanitizer((start) => {
			if (start > 0) return start - 1;
			return start;
		}),
	query("end")
		.default(10)
		.toInt()
		.isNumeric()
		.withMessage("End must be a number")
		.isLength({ min: 0 })
		.withMessage("End cannot be negative")
		.custom((end, { req }) => !(end <= Number(req?.query?.start)))
		.withMessage("End must be larger than start")
		.custom((end, { req }) => !(end - Number(req?.query?.start) >= 30))
		.withMessage("Maximum number of items requested is 30"),
	query("search")
		.default("")
		.trim()
		.escape()
		.isString()
		.withMessage("Search must be a string"),
	query("orderBy")
		.default("date")
		.trim()
		.escape()
		.custom((orderBy) => orderBy === "date" || orderBy === "title")
		.withMessage("Order must be by title or date"),
	query("order")
		.default("asc")
		.trim()
		.escape()
		.custom((order) => order === "asc" || order === "desc")
		.withMessage("Order must be asc or desc"),
];

const validatePost = (validateId = false) => [
	body("title")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Title cannot be empty")
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

const validatePostId = () => [
	param("postId")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Post's id cannot be empty")
		.bail()
		.toInt()
		.isNumeric()
		.withMessage("Post's id must be a number")
		.bail(),

	async (req: Request, res: Response, next: NextFunction) => {
		const postExists = await prisma.post.findUnique({
			where: { id: req?.params?.postId as unknown as number },
		});

		if (!postExists) throw new AppError(404, "Post does not exist");
		next();
	},
];

const validateCategory = (validateId = false) => [
	body("name")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Category cannot be empty")
		.bail()
		.isString()
		.withMessage("Category must be a string")
		.bail()
		.custom(async (name, { req }) => {
			const categoryExists = await prisma.category.findFirst({
				where: { id: { not: req?.params?.categoryId }, name },
			});

			if (categoryExists) throw new Error("Category must be unique");
		}),
	body("posts")
		.trim()
		.escape()
		.optional()
		.toArray()
		.isArray()
		.withMessage("Posts must be an array of titles")
		.bail()
		.custom(async (posts) => {
			for (let post of posts) {
				const postExists = await prisma.post.findUnique({
					where: { title: post },
				});

				if (!postExists) throw new Error("Some posts don't exist");
			}
		}),
];

const validateCategoryId = () => [
	param("categoryId")
		.trim()
		.escape()
		.notEmpty()
		.withMessage("Category's id cannot be empty")
		.bail()
		.toInt()
		.isNumeric()
		.withMessage("Category's id must be a number")
		.bail(),

	async (req: Request, res: Response, next: NextFunction) => {
		const categoryExists = await prisma.category.findUnique({
			where: { id: req?.params?.categoryId as unknown as number },
		});

		if (!categoryExists) throw new AppError(404, "Category does not exist");
		next();
	},
];

const validateResults = (req: Request) => {
	const errors = validationResult(req);

	if (!errors.isEmpty())
		throw new AppError(
			422,
			errors
				.formatWith(({ msg }) => msg)
				.array()
				.join("\n")
		);

	return matchedData(req);
};

export {
	validateResults,
	validateQueries,
	validatePost,
	validatePostId,
	validateCategory,
	validateCategoryId,
};
