import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Order } from "../order-model";
import { populate } from "dotenv";



export const getMyOrders:RequestHandler = 
async(
    req,
    res,
    next
) => {
    try{
        const id=req.user!.id;
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Invalid user ID format"
            });
        }
        const orders=await Order.find({userID:id})
        .populate("userID","name")
        .sort({createdAt:-1});
        return res.status(StatusCodes.OK).json({
            message:"Orders fetched successfully",
            data:orders
        });
    }catch(err){
        next(err);
    }
}