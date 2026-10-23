import { RequestHandler } from "express";
import { Product } from "../product-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { body } from "express-validator";


export const updateProductValidation = [
    body("categoryID").optional().isMongoId().withMessage("Invalid category ID format"),
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("description").optional().trim(),
];

interface IRequest {
    categoryID?: string;
    name?: string;
    price?: number;
    description?: string;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const updateProduct: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res,next) => {
    try {
        const { categoryID, name, price, description } = req.body;
        const imageUrl = req.file?.path;
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid product ID format" });
        }
        const product = await Product.findById(id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
        }
        const updateObject:any = {};
        if (categoryID) updateObject.categoryID = categoryID;
        if (name) updateObject.name = name;
        if (price) updateObject.price = price;
        if (description) updateObject.description = description;
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