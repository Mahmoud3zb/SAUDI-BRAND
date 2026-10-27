import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Cart } from "../cart-model";



export const removeFromCart:RequestHandler<{productID:string}>=async(req,res,next)=>{
    try{
        const productID=req.params.productID;
        const userID=req.user!.id;
        const cart=await Cart.findOne({userID});
        if(!cart){
            return res.status(StatusCodes.NOT_FOUND).json({message:"Cart not found"});
        }
        const itemIndex=cart.items.findIndex((item)=>item.productID.toString()===productID);
        if(itemIndex===-1){
            return res.status(StatusCodes.NOT_FOUND).json({message:"Item not found in cart"});
        }
        cart.items.splice(itemIndex,1);
        await cart.save();
        return res.status(StatusCodes.OK).json({
            message:"Item removed from cart successfully",
            data:cart
        });
    }catch(err){
        next(err);
    }
}