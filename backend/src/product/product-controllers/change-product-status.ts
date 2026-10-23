import { RequestHandler } from "express";
import { Product } from "../product-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";



export const changeProductStatus: RequestHandler<{ id: string }> = async (req, res, next) => {
    try{
        const id = req.params.id;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Product not found",
            });
        }
        product.isActive = !product.isActive;
        await product.save();
        return res.status(StatusCodes.OK).json({
            message: `Product status changed to ${product.isActive}`,
            data: product,
        });
    }catch(err){
        next(err);
    }
}