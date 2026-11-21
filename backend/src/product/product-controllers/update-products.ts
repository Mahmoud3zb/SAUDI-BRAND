import { RequestHandler } from "express";
import { Product } from "../product-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { body } from "express-validator";


export const updateProductValidation = [
    body("categoryID").optional().isMongoId().withMessage("Invalid category ID format"),
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("originalPrice").optional().isFloat({ min: 0 }).withMessage("Original price must be a positive number"),
    body("stockQuantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
    body("isFeatured").optional().isBoolean(),
    body("description").optional().trim(),
];

interface IRequest {
    categoryID?: string;
    name?: string;
    price?: number;
    originalPrice?: number;
    stockQuantity?: number;
    isFeatured?: boolean;
    slug?: string;
    description?: string;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const updateProduct: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const {
            categoryID,
            name,
            price,
            originalPrice,
            stockQuantity,
            isFeatured,
            slug,
            description
        } = req.body;
        const imageUrl = req.file?.path || (req.body as any).imageUrl;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product ID format" });
        }
        const product = await Product.findById(id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
        }
        const updateObject: any = {};
        if (categoryID) updateObject.categoryID = categoryID;
        if (name) updateObject.name = name;
        if (price !== undefined) updateObject.price = Number(price);
        if (originalPrice !== undefined) updateObject.originalPrice = Number(originalPrice);
        if (stockQuantity !== undefined) updateObject.stockQuantity = Number(stockQuantity);
        if (isFeatured !== undefined) updateObject.isFeatured = Boolean(isFeatured);
        if (slug) updateObject.slug = slug;
        if (description !== undefined) updateObject.description = description;
        if (imageUrl) updateObject.imageUrl = imageUrl;
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateObject },
            { new: true, runValidators: true });
        return res.status(StatusCodes.OK).json({
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (err) {
        next(err);
    }
};