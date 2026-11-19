import mongoose from "mongoose";

export interface IProductRating {
    score: number;
    count: number;
}

export interface IProduct {
    categoryID: mongoose.Types.ObjectId;
    name: string;
    slug?: string;
    price: number;
    originalPrice?: number;
    stockQuantity?: number;
    rating?: IProductRating;
    imageUrl: string;
    description: string;
    isFeatured?: boolean;
    isActive?: boolean;
}

const ProductSchema = new mongoose.Schema<IProduct>({
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Product name must be at least 2 characters long"]
    },
    slug: {
        type: String,
        trim: true,
        sparse: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Product price must be at least 0"]
    },
    originalPrice: {
        type: Number,
        min: [0, "Original price must be at least 0"]
    },
    stockQuantity: {
        type: Number,
        default: 10,
        min: [0, "Stock quantity must be at least 0"]
    },
    rating: {
        score: { type: Number, default: 5 },
        count: { type: Number, default: 0 }
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ categoryID: 1, isActive: 1 });
ProductSchema.index({ price: 1 });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);