import express, { json, Request, Response } from "express";
import mongoose from "mongoose";
import { authRoutes } from "./routes/auth";
import dotenv from "dotenv"
dotenv.config()

const app = express();

app.use(express.json());

app.use("/api/v1/", authRoutes);


app.use("/api/v1/content", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

async function main(){
    await mongoose.connect(process.env.MONGODB_URI as string)

    app.listen(8000, () => {
        console.log("Server started at port 8000");
    });
}
main()


