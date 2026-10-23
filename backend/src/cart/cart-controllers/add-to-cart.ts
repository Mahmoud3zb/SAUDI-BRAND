import { RequestHandler } from "express";
import { Cart } from "../cart-model";
import { Product } from "../../product/product-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

interface IRequest {
    productID: string;
    quantity: number;
}


interface IResponse {
    message: string;
    data?: unknown;
}

export const addToCart: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const userID = req.user?.id;
        const { productID, quantity } = req.body;

        const product = await Product.findById(productID);

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Product not found",
            });
        }

        let cart = await Cart.findOne({ userID });

        if (!cart) {
            cart = await Cart.create({
                userID,
                items: [{ productID, quantity }],
            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.productID.toString() === productID
            );

            if (itemIndex !== -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productID: new mongoose.Types.ObjectId(productID) , quantity });
            }

            await cart.save();
        }

        return res.status(StatusCodes.OK).json({
            message: "Product added to cart successfully",
            data: cart
        });
    } catch (err) {
        next(err);
    }
};