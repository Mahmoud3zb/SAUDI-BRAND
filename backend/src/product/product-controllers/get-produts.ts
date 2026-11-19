import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Product } from "../product-model";
import { Category } from "../../category/category-model";

export const getProducts: RequestHandler = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));

        const filter: Record<string, any> = {};

        // Only show active products for storefront, unless explicitly requested (e.g. by admin)
        if (req.query.all !== "true") {
            filter.isActive = true;
        }

        // Featured products filter
        if (req.query.featured === "true") {
            filter.isFeatured = true;
        }

        // Category filter (support category ObjectId or slug)
        const categoryParam = req.query.categoryId as string | undefined;
        if (categoryParam) {
            if (mongoose.Types.ObjectId.isValid(categoryParam)) {
                filter.categoryID = categoryParam;
            } else {
                const category = await Category.findOne({
                    $or: [{ slug: categoryParam }, { name: categoryParam }]
                });
                if (category) {
                    filter.categoryID = category._id;
                } else {
                    // Category specified but not found -> return empty data cleanly
                    return res.status(StatusCodes.OK).json({
                        message: "Products fetched successfully",
                        page,
                        limit,
                        total: 0,
                        totalPages: 0,
                        data: []
                    });
                }
            }
        }

        // Search query filter (search in name and description)
        const searchQuery = (req.query.q || req.query.search) as string | undefined;
        if (searchQuery && searchQuery.trim()) {
            const escaped = searchQuery.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            filter.$or = [
                { name: { $regex: escaped, $options: "i" } },
                { description: { $regex: escaped, $options: "i" } }
            ];
        }

        // Sorting options
        let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
        const sortParam = req.query.sort as string | undefined;
        if (sortParam === "price_asc") {
            sortOption = { price: 1 };
        } else if (sortParam === "price_desc") {
            sortOption = { price: -1 };
        } else if (sortParam === "name_asc") {
            sortOption = { name: 1 };
        }

        const [products, total] = await Promise.all([
            Product.find(filter)
                .populate("categoryID", "name slug")
                .sort(sortOption)
                .skip((page - 1) * limit)
                .limit(limit),
            Product.countDocuments(filter)
        ]);

        return res.status(StatusCodes.OK).json({
            message: "Products fetched successfully",
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: products
        });
    } catch (err) {
        next(err);
    }
};