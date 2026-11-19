import { RequestHandler } from "express";
import { Product } from "../product-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";


export const getProduct: RequestHandler<{ id: string }> = async (
    req,
    res,
    next
) => {
    try {
        const { id } = req.params;
        let product = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            product = await Product.findById(id).populate("categoryID", "name slug");
        }
        
        if (!product) {
            product = await Product.findOne({ slug: id }).populate("categoryID", "name slug");
        }

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