import express, { Request, Response } from "express";
import authRouter from "./routes/auth.router";
import errorHandler from "./middleware/error.middleware";
import "./config/passport.config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);

app.use(errorHandler);

export default app;
