import { RequestHandler } from "express";
import { Order, Status } from "../order-model";
import { Product } from "../../product/product-model";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";

export const updateOrderStatusValidation = [
    body("status")
        .notEmpty().withMessage("Status is required")
        .isIn(Object.values(Status)).withMessage("Invalid status"),
];

interface IRequest {
    status: Status;
}
interface IResponse {
    message: string;
    data?: any;
}

export const updateOrderStatus: RequestHandler<{ id: string }, IResponse, IRequest> = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status: newStatus } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "Order not found",
            });
        }

        const oldStatus = order.status;

        // Stock synchronization on status changes
        if (oldStatus !== Status.CANCELLED && newStatus === Status.CANCELLED) {
            // Restore inventory when order is cancelled
            for (const item of order.items) {
                if (item.productID) {
                    await Product.findByIdAndUpdate(item.productID, {
                        $inc: { stockQuantity: item.quantity }
                    });
                }
            }
        } else if (oldStatus === Status.CANCELLED && newStatus !== Status.CANCELLED) {
            // Re-deduct inventory if order was restored from cancelled
            for (const item of order.items) {
                if (item.productID) {
                    await Product.findByIdAndUpdate(item.productID, {
                        $inc: { stockQuantity: -item.quantity }
                    });
                }
            }
        }

        order.status = newStatus;
        await order.save();

        const updatedOrder = await Order.findById(id).populate("items.productID", "name price imageUrl");

        return res.status(StatusCodes.OK).json({
            message: "Order updated successfully",
            data: updatedOrder || order,
        });
    } catch (err) {
        next(err);
    }
};