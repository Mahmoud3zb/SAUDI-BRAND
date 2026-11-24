import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Waste } from "../waste-model";
import { Product } from "../../product/product-model";

export const getWasteRecords: RequestHandler = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const reason = req.query.reason as string | undefined;
        const search = req.query.search as string | undefined;

        const filter: any = {};
        if (reason && reason !== "all") {
            filter.reason = reason;
        }
        if (search && search.trim()) {
            filter.productName = { $regex: search.trim(), $options: "i" };
        }

        const skip = (page - 1) * limit;

        const [records, total] = await Promise.all([
            Waste.find(filter)
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("createdBy", "name email")
                .populate("productID", "name price imageUrl costPrice"),
            Waste.countDocuments(filter)
        ]);

        return res.status(StatusCodes.OK).json({
            data: records,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) || 1
            }
        });
    } catch (err) {
        next(err);
    }
};

export const createWaste: RequestHandler = async (req, res, next) => {
    try {
        const {
            productID,
            productName,
            quantity,
            costPerUnit,
            reason = "other",
            date,
            notes,
            deductFromStock = true
        } = req.body;

        const qty = Math.max(1, Number(quantity) || 1);
        let unitCost = Number(costPerUnit);
        let finalProductName = productName ? String(productName).trim() : "";

        // If productID is provided, verify and auto-fill details
        let product = null;
        if (productID) {
            product = await Product.findById(productID);
            if (product) {
                if (!finalProductName) finalProductName = product.name;
                if (isNaN(unitCost) || unitCost <= 0) {
                    unitCost = product.costPrice || 0;
                }
            }
        }

        if (!finalProductName) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "يرجى اختيار المنتج أو كتابة اسم المنتج التالف"
            });
        }

        const totalCost = Number((qty * Math.max(0, unitCost || 0)).toFixed(2));

        const waste = await Waste.create({
            productID: product?._id,
            productName: finalProductName,
            quantity: qty,
            costPerUnit: Math.max(0, unitCost || 0),
            totalCost,
            reason,
            date: date ? new Date(date) : new Date(),
            notes: notes ? String(notes).trim() : undefined,
            createdBy: req.user?.id
        });

        // Optionally decrement stock quantity from product
        if (product && deductFromStock && product.stockQuantity !== undefined) {
            await Product.findByIdAndUpdate(product._id, {
                $inc: { stockQuantity: -qty }
            });
        }

        return res.status(StatusCodes.CREATED).json({
            message: "تم تسجيل الهالك والتوالف بنجاح",
            data: waste
        });
    } catch (err) {
        next(err);
    }
};

export const deleteWaste: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const waste = await Waste.findByIdAndDelete(id);

        if (!waste) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "سجل الهالك غير موجود أو تم حذفه مسبقاً"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "تم حذف سجل الهالك بنجاح"
        });
    } catch (err) {
        next(err);
    }
};

