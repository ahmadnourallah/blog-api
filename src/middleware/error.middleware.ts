import { Request, Response, NextFunction } from "express";

class AppError extends Error {
	public code;

	constructor(code: number, message: string) {
		super(message);
		this.code = code;
	}
}

const errorHandler = (
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	res.status(err.code || 500).json({
		error: {
			code: err.code || 500,
			message:
				err instanceof AppError ? err.message : "Internal server error",
		},
	});
};

export { errorHandler as default, AppError };
