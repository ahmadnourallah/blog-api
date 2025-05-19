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

const getComment = async (req: Request, res: Response) => {
	const { commentId } = validateResults(req);

	const comment = await prisma.comment.findUnique({
		where: { id: commentId },
		include: { replies: true },
	});

	res.status(200).send({ data: comment });
};

const createComment = async (req: Request, res: Response) => {
	const { content, authorId, postId, parentCommentId } = validateResults(req);

	const comment = await prisma.comment.create({
		data: {
			content,
			author: { connect: { id: authorId } },
			post: { connect: { id: postId } },
			parentComment:
				parentCommentId !== undefined
					? { connect: { id: parentCommentId } }
					: undefined,
		},
	});

	res.status(201).json({ success: true, data: comment });
};

export default {
	getComments,
	getComment,
	createComment,
};
