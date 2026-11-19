import { RequestHandler } from "express";
import { body } from "express-validator";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Cart } from "../../cart/cart-model";
import { Product } from "../../product/product-model";
import { Order, PaymentMethod } from "../order-model";

export const createOrderValidation = [
    body("customerName")
        .trim()
        .notEmpty().withMessage("اسم العميل مطلوب")
        .isLength({ min: 2 }).withMessage("يجب أن يكون الاسم حرفين على الأقل"),
    body("customerPhone")
        .trim()
        .notEmpty().withMessage("رقم الموبايل مطلوب")
        .isLength({ min: 10 }).withMessage("رقم الموبايل يجب أن يكون 11 رقماً"),
    body("shippingAddress.city")
        .trim()
        .notEmpty().withMessage("المحافظة مطلوبة"),
    body("shippingAddress.street")
        .trim()
        .notEmpty().withMessage("العنوان / اسم الشارع بالتفصيل مطلوب"),
    body("shippingAddress.district").optional().trim(),
    body("shippingAddress.notes").optional().trim(),
    body("paymentMethod").optional().isIn(["cod", "vodafone_cash", "instapay", "card", "tabby", "tamara"]),
];

export const createOrder: RequestHandler = async (req, res, next) => {
    try {
        const userID = req.user?.id;
        const {
            customerName,
            customerPhone,
            shippingAddress,
            paymentMethod = "cod",
            items: bodyItems
        } = req.body;

        let itemsToOrder: Array<{ productID: string | mongoose.Types.ObjectId; quantity: number }> = [];

        // 1. Determine items: from client payload or from user's backend cart
        if (Array.isArray(bodyItems) && bodyItems.length > 0) {
            itemsToOrder = bodyItems.map(it => ({
                productID: it.productID || it.id || it.product?.id,
                quantity: Math.max(1, Number(it.quantity) || 1)
            }));
        } else if (userID) {
            const cart = await Cart.findOne({ userID });
            if (cart && cart.items.length > 0) {
                itemsToOrder = cart.items.map(it => ({
                    productID: it.productID,
                    quantity: it.quantity
                }));
            }
        }

        if (itemsToOrder.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "سلة المشتريات فارغة، لا يمكن إتمام الطلب"
            });
        }

        // 2. Fetch products securely from DB to verify price & stock
        const validProductIDs = itemsToOrder
            .map(it => String(it.productID))
            .filter(id => mongoose.Types.ObjectId.isValid(id));

        const products = await Product.find({
            _id: { $in: validProductIDs }
        });

        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        const orderItems: Array<{
            productID: mongoose.Types.ObjectId;
            quantity: number;
            price: number;
        }> = [];

        for (const item of itemsToOrder) {
            const prod = productMap.get(String(item.productID));
            if (!prod) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `أحد المنتجات المطلوبة غير متوفر حالياً`
                });
            }

            orderItems.push({
                productID: prod._id as mongoose.Types.ObjectId,
                quantity: item.quantity,
                price: prod.price
            });

            // Deduct inventory
            if (prod.stockQuantity !== undefined && prod.stockQuantity > 0) {
                prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
                await prod.save();
            }
        }

        // 3. Compute totals
        const itemsTotal = orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // 3. Compute shipping fee based on Egyptian governorates
        // 100 EGP: القاهرة والجيزة
        // 80 EGP: الدلتا ومحافظات القناة والإسكندرية
        // 60 EGP: الصعيد والوجه القبلي
        const deltaCities = [
            "الإسكندرية", "القليوبية", "الدقهلية", "المنصورة", "الشرقية", "الغربية", "طنطا",
            "المنوفية", "دمياط", "كفر الشيخ", "البحيرة", "دمنهور", "بورسعيد", "الإسماعيلية", "السويس"
        ];
        const saidCities = [
            "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان",
            "البحر الأحمر", "الغردقة", "الوادي الجديد", "مطروح", "شمال سيناء", "جنوب سيناء"
        ];

        const targetCity = (shippingAddress.city || "").trim();
        let shippingFee = 100; // الافتراضي القاهرة والجيزة
        if (saidCities.some(c => targetCity.includes(c))) {
            shippingFee = 60; // الصعيد
        } else if (deltaCities.some(c => targetCity.includes(c))) {
            shippingFee = 80; // الدلتا
        }

        const grandTotal = itemsTotal + shippingFee;

        // 4. Create Order document
        const order = await Order.create({
            userID: userID && mongoose.Types.ObjectId.isValid(userID) ? userID : undefined,
            customerName,
            customerPhone,
            shippingAddress: {
                city: shippingAddress.city,
                district: shippingAddress.district || "",
                street: shippingAddress.street,
                notes: shippingAddress.notes || ""
            },
            items: orderItems,
            totalPrice: grandTotal,
            shippingFee,
            paymentMethod: paymentMethod as PaymentMethod,
            paymentStatus: "unpaid"
        });

        // 5. Clear backend cart if user was authenticated
        if (userID) {
            await Cart.findOneAndUpdate({ userID }, { items: [] });
        }

        const populatedOrder = await Order.findById(order._id).populate("items.productID", "name price imageUrl");

        return res.status(StatusCodes.CREATED).json({
            message: "تم استلام طلبك بنجاح! شكراً لتسوقك من سعودي براند",
            order: populatedOrder || order
        });

    } catch (error) {
        next(error);
    }
};