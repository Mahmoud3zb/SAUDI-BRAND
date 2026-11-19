import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Cart } from "../cart-model";


export const getCart: RequestHandler = async (req, res, next) => {
    try {
        const userID = req.user!.id;
        if (!mongoose.Types.ObjectId.isValid(userID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid user ID format"
            });
        }
        const cart = await Cart.findOne({ userID }).populate("items.productID");
        if (!cart) {
            return res.status(StatusCodes.OK).json({
                message: "Cart fetched successfully",
                data: { userID, items: [] }
            });
        }
        return res.status(StatusCodes.OK).json({ 
            message: "Cart fetched successfully",
            data: cart
        });
    } catch (err) {
        next(err);
    }
};