import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserModel } from "../db";
import { JWT_USER_PASSWORD } from "../config";

const authRoutes = Router();

authRoutes.post("/signup", async (req: Request, res: Response) => {
    try {
        const requiredBody = z.object({
            username: z.string().min(3).max(10),
            password: z.string().min(8).max(20),
        });

        const parsedDataWithSuccess = requiredBody.safeParse(req.body);

        if (!parsedDataWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect format",
                error: parsedDataWithSuccess.error,
            });
        }

        const { username, password } = parsedDataWithSuccess.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        await UserModel.create({
            username: username,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "Signup successful",
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

authRoutes.post("/signin", async (req: Request, res: Response) => {
    try {
        const requiredBody = z.object({
            username: z.string().min(3).max(10),
            password: z.string().min(8).max(20),
        });

        const parsedDataWithSuccess = requiredBody.safeParse(req.body);

        if (!parsedDataWithSuccess.success) {
            return res.status(400).json({
                message: "Incorrect format",
                error: parsedDataWithSuccess.error,
            });
        }

        const username = req.body.username;
        const password = req.body.password;

        const response = await UserModel.findOne({
            username: username,
        });

        if (!response) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const checkPassword = await bcrypt.compare(password, response.password);

        if(!checkPassword){
            return res.status(401).json({
                message:"Invalid username or password"
            })
        }

        if (response && checkPassword) {
            const token = jwt.sign(
                {
                    id: response._id.toString(),
                },
                JWT_USER_PASSWORD,
                {
                    expiresIn:"24h"
                }
            );

            return res.status(200).json({
                token: token,
                message: "Signed-in successfully",
            });
        } else {
            return res.status(403).json({
                message: "invalid creds",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Signin failed",
        });
    }
});

export { authRoutes };
