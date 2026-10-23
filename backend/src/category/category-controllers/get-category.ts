import { RequestHandler } from "express";
import { Category } from "../category-model";
import { StatusCodes } from "http-status-codes";



export const getCategory: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
        const id = req.params.id;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
            });
        }
        return res.status(StatusCodes.OK).json({
            message: "Category fetched successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
};