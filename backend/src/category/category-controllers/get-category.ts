import { RequestHandler } from "express";
import mongoose from "mongoose";
import { Category } from "../category-model";
import { StatusCodes } from "http-status-codes";

export const getCategory: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
        const id = req.params.id;
        let category = null;

        if (mongoose.Types.ObjectId.isValid(id)) {
            category = await Category.findById(id);
        }
        if (!category) {
            category = await Category.findOne({ slug: id });
        }

        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({
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