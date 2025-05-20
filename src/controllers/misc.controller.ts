import { Request, Response } from "express";
import { ClientError } from "../middleware/error.middleware";

const notFound = (req: Request, res: Response) => {
	throw new ClientError({ resource: "Resource not found" }, 404);
};

export default { notFound };
