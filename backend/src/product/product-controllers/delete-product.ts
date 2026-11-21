import { RequestHandler } from "express";
import { Product } from "../product-model";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";

export const deleteProduct: RequestHandler<{ id: string }> = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "معرف المنتج غير صالح"
            });
        }

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "المنتج غير موجود أو تم حذفه مسبقاً"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "تم حذف المنتج بنجاح"
        });
    } catch (error) {
        next(error);
    }
};

