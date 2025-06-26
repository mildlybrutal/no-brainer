import express, { Request, Response, NextFunction } from "express";

interface RequestCount {
    count: number;
    lastRequest: number;
}

interface RequestCounts {
    [ip: string]: RequestCount;
}

const requestCounts: RequestCounts = {};

const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
    const ip: string = req.ip || req.socket.remoteAddress || "unknown";
    const now: number = Date.now();

    if (!requestCounts[ip]) {
        requestCounts[ip] = {
            count: 1,
            lastRequest: now,
        };
    } else {
        const timeSinceLastRequest: number =
            now - requestCounts[ip].lastRequest;
        const timeLimit: number = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastRequest < timeLimit) {
            requestCounts[ip].count += 1;
        } else {
            requestCounts[ip] = {
                count: 1,
                lastRequest: now,
            };
        }
    }

    const maxRequests: number = 100;
    if (requestCounts[ip].count > maxRequests) {
        res.status(429).json({
            message: "Too many requests, please try again later.",
        });
        return;
    }

    requestCounts[ip].lastRequest = now;
    next();
};

export default rateLimiter;
