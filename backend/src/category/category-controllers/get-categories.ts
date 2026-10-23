import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Category } from "../category-model";

export const getCategories: RequestHandler = async (req, res, next) => {
    try {
        const categories = await Category.find({});
        return res.status(StatusCodes.OK).json({
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (err) {
        next(err);
    }
};