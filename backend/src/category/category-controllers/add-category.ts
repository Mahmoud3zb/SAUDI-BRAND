import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Category } from "../category-model";
import { body } from "express-validator";


export const addCategoryValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("description").optional().trim(),
    body("isActive").optional().isBoolean(),
];

interface IRequest {
    name: string;
    description?: string;
    isActive?: boolean;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const addCategory: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { name, description, isActive } = req.body;
        const category = await Category.create({
            name,
            description,
            isActive,
        });
        return res.status(StatusCodes.CREATED).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};