import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../user-model";


export const getUsers: RequestHandler = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );
        const [users, total] = await Promise.all([
            User.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User.countDocuments()
        ])
        return res.status(StatusCodes.OK).json({
            message: "Users fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: users
        });
    } catch (err) {
        next(err);
    }
}