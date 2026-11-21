import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { UserToken } from "../interfaces/user-token";

export const isAuthenticated: RequestHandler = (req, res, next) => {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
        token = req.cookies.token;
    }

    if (!token) {
        res.status(401).json({ message: "انتهت الجلسة، يرجى تسجيل الدخول مجدداً" });
        return;
    }

    try {
        req.user = <UserToken>jwt.verify(token, process.env.secretKey!);
        next();
    } catch (error) {
        res.status(401).json({ message: "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً" });
    }
};

export const optionalAuth: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
            req.user = <UserToken>jwt.verify(token, process.env.secretKey!);
        } catch {
            // Optional auth: continue as guest if token is invalid or expired
        }
    }
    next();
};