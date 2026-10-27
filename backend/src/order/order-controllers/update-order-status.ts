import { RequestHandler } from "express";
import { Order, Status } from "../order-model";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";

export const updateOrderStatusValidation = [
    body("status")
    .isEmpty().withMessage("Status is required")
    .isIn(Object.values(Status)).withMessage("Invalid status"),
];

interface IRequest {
    status: Status;
}
interface IResponse{
    message: string;
    data?: any;
}
export const updateOrderStatus: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        );
        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Order not found",
            });
        }
        return res.status(StatusCodes.OK).json({
            message: "Order updated successfully",
            data: order,
        });
    } catch (err) {
        next(err);
    }
}