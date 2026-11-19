import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Category } from "../category-model";
import { body } from "express-validator";


export const addCategoryValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("slug").optional().trim(),
    body("description").optional().trim(),
    body("isActive").optional().isBoolean(),
];

interface IRequest {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const addCategory: RequestHandler<{}, IResponse, IRequest> = async (req, res, next) => {
    try {
        const { name, slug, description, isActive } = req.body;
        const generatedSlug =
            slug ||
            name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w\u0621-\u064A-]+/g, "");

        const category = await Category.create({
            name,
            slug: generatedSlug,
            description,
            isActive: isActive !== undefined ? isActive : true,
        });
        return res.status(StatusCodes.CREATED).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};