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
            res.status(400).json({
                message: "Incorrect format",
                error: parsedDataWithSuccess.error,
            });
            return
        }

        const { username, password } = parsedDataWithSuccess.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            res.status(400).json({
                message: "User already exists",
            });
            return
        }

        await UserModel.create({
            username: username,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Signup successful",
        });
        return;
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
        return
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
            res.status(400).json({
                message: "Incorrect format",
                error: parsedDataWithSuccess.error,
            });
            return
        }

        const username = req.body.username;
        const password = req.body.password;

        const response = await UserModel.findOne({
            username: username,
        });

        if (!response) {
            res.status(401).json({
                message: "Invalid username or password",
            });
            return
        }

        const checkPassword = await bcrypt.compare(password, response.password);

        if(!checkPassword){
            res.status(403).json({
                message:"Invalid username or password"
            })
            return
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

            res.status(200).json({
                token: token,
                message: "Signed-in successfully",
            });
            return
        } else {
            res.status(403).json({
                message: "invalid creds",
            });
            return
        }
    } catch (error) {
        res.status(500).json({
            message: "Signin failed",
        });
        return
    }
});

export { authRoutes };
