import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Order } from "../order-model";


export const getOrder:RequestHandler<{id:string}>= async (req,res,next)=>{
    try{
        const orderID=req.params.id;
        if(!mongoose.Types.ObjectId.isValid(orderID)){
            return res.status(StatusCodes.BAD_REQUEST).json({
                message:"Invalid order ID format"
            });
        }
        const order=await Order.findById(orderID);
        if(!order){
            return res.status(StatusCodes.NOT_FOUND).json({
                message:"Order not found"
            });
        }
        return res.status(StatusCodes.OK).json({
            message:"Order fetched successfully",
            data:order
        });
    }catch(err){
        next(err);
    }
}