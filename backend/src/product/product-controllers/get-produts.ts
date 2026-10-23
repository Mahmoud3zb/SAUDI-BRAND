import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Product } from "../product-model";


export const getProducts: RequestHandler = async (req, res,next) => {
    try{
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );
        const [products, total] = await Promise.all([
            Product.find()
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Product.countDocuments()
        ])
        return res.status(StatusCodes.OK).json({
            message: "Products fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: products
        });
    }catch(err){
        next(err);
    }
}