import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_USER_PASSWORD } from "../src/config";

interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_USER_PASSWORD) as { id: string };
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
        return;
    }
};
