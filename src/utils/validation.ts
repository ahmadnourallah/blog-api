import { Request } from "express";
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

const validatePostId = () =>
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
		});

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

export { validateResults, validateQueries, validatePost, validatePostId };
