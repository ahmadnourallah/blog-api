import express from "express";
import authRouter from "./routes/auth.router";
import postRouter from "./routes/post.router";
import categoryRouter from "./routes/category.router";
import commentRouter from "./routes/comment.router";
import userRouter from "./routes/user.router";
import miscRouter from "./routes/misc.router";
import {
	serverErrorHandler,
	clientErrorHandler,
} from "./middleware/error.middleware";
import "./config/passport.config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/posts", postRouter);
app.use("/categories", categoryRouter);
app.use("/comments", commentRouter);
app.use("/users", userRouter);
app.use("/", miscRouter);

app.use(clientErrorHandler);
app.use(serverErrorHandler);

export default app;
