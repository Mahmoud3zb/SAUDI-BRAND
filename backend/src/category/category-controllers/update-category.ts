import { RequestHandler } from "express";
import { Category } from "../category-model";
import { StatusCodes } from "http-status-codes";

interface IRequest {
    name?: string;
    description?: string;
}

interface IResponse {
    message: string;
    data?: unknown;
}

export const updateCategory: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        const updateObj:any = {};
        if (name) {
            updateObj.name = name;
        }
        if (description) {
            updateObj.description = description;
        }
        const category = await Category.findByIdAndUpdate(
            id,
            { $set: updateObj },
            { new: true }
        );
        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Category not found",
            });
        }
        return res.status(StatusCodes.OK).json({
            message: "Category updated successfully",
            data: category,
        });
    } catch (err) {
        next(err);
    }
}
