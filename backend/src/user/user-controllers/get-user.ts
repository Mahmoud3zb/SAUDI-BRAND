import { RequestHandler } from "express";
import mongoose from "mongoose";
import { User } from "../user-model";
import { StatusCodes } from "http-status-codes";


export const getUser: RequestHandler<{ id: string }> = async (
    req,
    res,
    next
) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Invalid user ID format"
            });
        }
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User not found"
            });
        }
        return res.status(StatusCodes.OK).json({
            message: "User fetched successfully",
            data: user
        });
    } catch (err) {
        next(err);
    }
};