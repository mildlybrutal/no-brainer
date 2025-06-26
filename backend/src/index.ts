import express, { json, Request, Response } from "express";
import mongoose from "mongoose";
import { authRoutes } from "./routes/auth";
import { contentRoutes } from "./routes/content";
import { shareRoutes } from "./routes/share";
import { authMiddleware } from "./authMiddleware";
import rateLimiter from "./rateLimiter";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(rateLimiter)

app.use("/api/v1", authRoutes);

app.use("/api/v1/content", authMiddleware, contentRoutes);

app.use("/api/v1/brain", authMiddleware, shareRoutes);

async function main() {
    await mongoose.connect(process.env.MONGODB_URI as string);

    app.listen(8000, () => {
        console.log("Server started at port 8000");
    });
}
main();
