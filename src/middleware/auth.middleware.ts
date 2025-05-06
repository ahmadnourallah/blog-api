import { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware";
import { User as PrismaUser } from "../prisma/src/db";
import passport from "passport";

declare global {
	namespace Express {
		interface User extends PrismaUser {}
	}
}

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate(
		"jwt",
		{ session: false },
		(err: Error, user: any, info: string) => {
			if (err) next(err);

			if (!user) throw new AppError(403, "User is not authenticated");

			req.user = user;
			next();
		}
	)(req, res, next);
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
	if (req?.user?.role !== "ADMIN")
		throw new AppError(403, "User is not authorized");

	next();
};

export { isAuthenticated, isAdmin };
