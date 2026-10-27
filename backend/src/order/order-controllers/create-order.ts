import { RequestHandler } from "express";
import { Cart } from "../../cart/cart-model";
import { Product } from "../../product/product-model";
import { Order } from "../order-model";

export const createOrder: RequestHandler = async (
    req,
    res,
    next
) => {
    try {
        const userID = req.user?.id;

        const cart = await Cart.findOne({ userID });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Your cart is empty"
            });
        }

        const productIDs = cart.items.map(item => item.productID);

        const products = await Product.find({
            _id: { $in: productIDs }
        });

        const productMap = new Map(
            products.map(product => [
                product._id.toString(),
                product
            ])
        );

        const orderItems = cart.items.map(item => {
            const product = productMap.get(
                item.productID.toString()
            );

            if (!product) {
                throw new Error(
                    `Product ${item.productID} is no longer available`
                );
            }

            return {
                productID: item.productID,
                quantity: item.quantity,
                price: product.price
            };
        });

        const totalPrice = orderItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );

        const order = await Order.create({
            userID,
            items: orderItems,
            totalPrice
        });

        cart.items = [];
        await cart.save();

        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        next(error);
    }
};