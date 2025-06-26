import express, { Router, Request, Response } from "express";
import { LinkModel, ContentModel } from "../db";
import { nanoid } from "nanoid";
import QRCode from "qrcode";

const shareRoutes = Router();

interface AuthRequest extends Request {
    userId?: string;
}

shareRoutes.post("/create", async (req: AuthRequest, res: Response) => {
    try {
        const { contentIds, shareType, expiresIn, permissions } = req.body;
        const userId = req.userId;

        const hash = nanoid(12);

        const expiresAt = expiresIn
            ? new Date(Date.now() + expiresIn * 24 * 60 * 1000)
            : undefined;

        const shareableLink = await LinkModel.create({
            hash,
            userId,
            contentIds: contentIds || [],
            shareType: shareType || "brain",
            permissions: {
                canView: true,
                canDownload: permissions?.canDownload || false,
                expiresAt,
            },
            isActive: true,
            accessCount: 0,
        });

        const shareURL = `http://localhost:3000/shared/${hash}`;
        const qrCode = await QRCode.toDataURL(shareURL);

        res.status(201).json({
            message: "Sharable link created",
            shareURL: shareURL,
            hash: hash,
            qrCode: qrCode,
            expiresAt: expiresAt,
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Failed to create shareable link" });
    }
});

shareRoutes.get("/:hash", async (req: AuthRequest, res: Response) => {
    try {
        const { hash } = req.params;
        const shareableLink = await LinkModel.findOne({
            hash,
            isActive: true,
        }).populate("userId", "username");

        if (!shareableLink) {
            res.status(404).json({
                message: "link not found",
            });
            return;
        }

        if (
            shareableLink?.permissions.expiresAt &&
            new Date() > shareableLink.permissions.expiresAt
        ) {
            res.status(410).json({
                message: "Shared link has expired",
            });
            return;
        }

        await LinkModel.findByIdAndUpdate(shareableLink._id, {
            $inc: {
                accessCount: 1,
            },
            lastAccessedAt: new Date(),
        });

        let content: any[] = [];
        if (shareableLink.shareType === "brain") {
            content = await ContentModel.find({
                userId: shareableLink.userId,
            }).populate("tags");
        } else if (shareableLink.contentIds.length > 0) {
            content = await ContentModel.find({
                _id: { $in: shareableLink.contentIds },
                userId: shareableLink.userId,
            }).populate("tags");
        }

        res.status(200).json({
            message: "Shared content retrieved",
            owner: shareableLink.userId,
            shareType: shareableLink.shareType,
            permissions: shareableLink.permissions,
            content: content,
            accessCount: shareableLink.accessCount,
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Failed to access shared content" });
        return;
    }
});

shareRoutes.delete("/:hash", async (req: AuthRequest, res: Response) => {
    try {
        const { hash } = req.params;
        const userId = req.userId;

        const result = await LinkModel.findOneAndUpdate(
            { hash, userId },
            { isActive: false },
            { new: true }
        );

        if (!result) {
            res.status(404).json({
                message: "hash not found",
            });
            return;
        }

        res.status(200).json({
            message: "Link delete successfully",
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Failed to revoke link" });
    }
});

shareRoutes.get("/", async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        const sharedLinks = await LinkModel.find({
            userId,
            isActive: true,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Shared links retrieved",
            links: sharedLinks.map((link) => ({
                hash: link.hash,
                shareType: link.shareType,
                accessCount: link.accessCount,
                createdAt: link.createdAt,
                expiresAt: link.permissions.expiresAt,
                shareUrl: `http://localhost:3000/shared/${link.hash}`,
            })),
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve shared links" });
        return
    }
});

export { shareRoutes };
