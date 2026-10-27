import { RequestHandler } from "express";
import { Cart } from "../cart-model";
import {StatusCodes} from "http-status-codes";

interface IResponse {
    message: string,
    data?: any
}
export const clearCart: RequestHandler<{}, IResponse, {}> = async (req, res,next) => {
    try {
        const userID = req.user!.id;

        const cart = await Cart.findOneAndUpdate(
            { userID },
            { items: [] }, 
            { new: true , runValidators: true }
        );

        if (!cart) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Cart not found" });
        }

        return res.status(StatusCodes.OK).json({
            message: "Cart cleared successfully",
            data: cart
        });

    } catch (error) {
        next(error);
    }
};