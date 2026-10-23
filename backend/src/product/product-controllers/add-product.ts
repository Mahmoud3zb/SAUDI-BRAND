import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Product } from "../product-model";
import { body } from "express-validator";
import mongoose from "mongoose";

export const addProductValidation = [
    body("categoryID")
        .trim()
        .notEmpty().withMessage("Category ID is required")
        .isMongoId().withMessage("Invalid category ID format"),
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("price")
        .notEmpty().withMessage("Price is required")
        .isNumeric().withMessage("Price must be a number"),
    body("description").optional().trim(),
    body("isActive").optional().isBoolean(),
];

export const addProduct: RequestHandler = async (req, res,next) => {
    try{
        const { categoryID, name, price, description, isActive } = req.body;
        const imageUrl=req.file?.path
        if(!mongoose.Types.ObjectId.isValid(categoryID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid category ID format",
            });
        }
        const product = await Product.create({
            categoryID,
            imageUrl,
            name,
            price,
            description,
            isActive,
        });
        return res.status(StatusCodes.CREATED).json({
            message: "Product created successfully",
            data: product,
        });
    }catch(err){
        next(err);
    }
};