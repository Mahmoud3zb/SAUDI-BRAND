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
        .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("originalPrice").optional().isFloat({ min: 0 }).withMessage("Original price must be a positive number"),
    body("stockQuantity").optional().isInt({ min: 0 }).withMessage("Stock quantity must be a non-negative integer"),
    body("isFeatured").optional().isBoolean(),
    body("description").optional().trim(),
    body("isActive").optional().isBoolean(),
];

export const addProduct: RequestHandler = async (req, res, next) => {
    try {
        const {
            categoryID,
            name,
            price,
            originalPrice,
            stockQuantity,
            isFeatured,
            slug,
            description,
            isActive
        } = req.body;

        const imageUrl = req.file?.path || req.body.imageUrl;
        if (!imageUrl) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Product image is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(categoryID)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid category ID format",
            });
        }

        const generatedSlug = slug || name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u0621-\u064A-]+/g, "");

        const product = await Product.create({
            categoryID,
            name,
            slug: generatedSlug,
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 10,
            isFeatured: Boolean(isFeatured),
            imageUrl,
            description,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Product created successfully",
            data: product,
        });
    } catch (err) {
        next(err);
    }
};