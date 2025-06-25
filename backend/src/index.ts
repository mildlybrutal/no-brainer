import express, { json, Request, Response } from "express";
import mongoose from "mongoose";
import { authRoutes } from "./routes/auth";
import { authMiddleware } from "./middleware";
import dotenv from "dotenv"
dotenv.config()

const app = express();

app.use(express.json());

app.use("/api/v1", authRoutes);

app.use(authMiddleware)

app.use("/api/v1/content", (req, res) => {});

app.use("/api/v1/brain", (req, res) => {});


async function main(){
    await mongoose.connect(process.env.MONGODB_URI as string)

    app.listen(8000, () => {
        console.log("Server started at port 8000");
    });
}
main()


