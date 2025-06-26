import express, { Router, Request, Response } from "express";
import { z } from "zod";

import { ContentModel, UserModel } from "../db";


interface AuthRequest extends Request {
    userId?: string;
}

const contentRoutes = Router();

const createContentSchema = z.object({
    link: z.string().url(),
    type: z.enum(["image", "audio", "video", "article"]),
    title: z.string().min(1),
    tags: z.array(z.string()).optional(),
    userId: z.string(),
});

contentRoutes.post("/", async (req: Request, res: Response) => {
    try {
        const validatedData = createContentSchema.parse(req.body);

        const content = await ContentModel.create(validatedData);

        res.status(201).json({
            message: "successfull",
            Content: content,
        });
        return;
    } catch (error) {
        res.status(500).json({
            message: "server error",
        });
    }
});

contentRoutes.get("/", async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;
        const content = await ContentModel.find({ userId }).populate('tags');

        res.status(200).json({
            message: "Content fetched successfully",
            content: content,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch content" });
    }
});

contentRoutes.delete("/:contentId", async (req: AuthRequest, res: Response) => {
    try {
        const { contentId } = req.params;
        const userId = req.userId
        const content = await ContentModel.findByIdAndDelete({
            _id:contentId,
            userId : userId
        });

        if (!content) {
            res.status(404).json({
                message: "Content not found or unauthorized",
            });
            return;
        }

        res.status(200).json({
            message: "content deleted successfuly",
            contentId: contentId,
        });
        return;
    } catch (error) {
        res.status(500).json({
            message: "content deletion failed",
        });
    }
});

export {contentRoutes}