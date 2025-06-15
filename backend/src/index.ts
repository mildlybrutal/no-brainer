import express, { json } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

app.post("/api/v1/signup", (req, res) => {});
app.post("/api/v1/signin", (req, res) => {});

app.post("/api/v1/content", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen("8000", () => {
    console.log("Server started at port 8000");
});
