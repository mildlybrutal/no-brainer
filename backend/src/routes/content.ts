import express, { Router, Request, Response } from "express";
import { z } from "zod";

import { ContentModel, UserModel } from "../db";

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

contentRoutes.get("/", async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(500).json({
                message: "userId is required",
            });
            return;
        }
        const user = await UserModel.findById(userId);

        if (!user) {
            res.status(404).json({
                message: "User does not exist",
            });
            return;
        }

        const content = await ContentModel.find({
            userId: userId,
        });

        if (!content) {
            res.status(500).json({
                message: "content does not exist",
            });
            return;
        }

        res.status(200).json({
            message: "content fetching succesfull",
            Content: content,
        });
    } catch (error) {
        res.status(500).json({
            message: "failed to fetch content",
        });
        return;
    }
});

contentRoutes.delete("/", async (req: Request, res: Response) => {
    try {
        const { contentId } = req.params;

        const content = await ContentModel.findByIdAndDelete(contentId);

        if (!content) {
            res.status(403).json({
                message: "Trying to delete a doc you don’t own",
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
