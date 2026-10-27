import { RequestHandler } from "express";
import { Order } from "../order-model";
import { StatusCodes } from "http-status-codes";



export const getOrders: RequestHandler = 
async (
    req,
    res,
    next
) => {
        try {
            const page = Math.max(1, Number(req.query.page) || 1);
            const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );
            const [orders, total] = await Promise.all([
                Order.find()
                    .populate("userID", "name")
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit),
                Order.countDocuments()
            ]);
            return res.status(StatusCodes.OK).json({
                message: "Orders fetched successfully",
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                data: orders
            });
        } catch (error) {
            next(error);
        }
    };