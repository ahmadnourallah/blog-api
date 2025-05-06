import { Request } from "express";
import { AppError } from "../middleware/error.middleware";
import { validationResult } from "express-validator";

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
};

export { validateResults };
