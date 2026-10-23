import { RequestHandler } from "express";
import { Product } from "../product-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";


export const getProduct: RequestHandler<{ id: string }> =
    async (
        req,
        res,
        next
    ) => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product ID format" });
            }
            const product = await Product.findById(id);
            if (!product) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
            }
            return res.status(StatusCodes.OK).json({ 
                message: "Product fetched successfully",
                data: product
            });
        } catch (err) {
            next(err);
        }
    };