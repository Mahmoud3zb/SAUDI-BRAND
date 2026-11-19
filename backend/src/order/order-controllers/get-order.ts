import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Order } from "../order-model";
import { Role } from "../../user/user-model";


export const getOrder: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
        const orderID = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(orderID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid order ID format"
            });
        }
        const order = await Order.findById(orderID).populate("items.productID");
        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Order not found"
            });
        }

        const isOwner = req.user?.id && order.userID.toString() === req.user.id;
        const isAdmin = req.user?.role === Role.ADMIN;

        if (!isOwner && !isAdmin) {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "Forbidden: You are not authorized to view this order"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "Order fetched successfully",
            data: order
        });
    } catch (err) {
        next(err);
    }
};