import mongoose from "mongoose";

interface IProduct{
    categoryID: mongoose.Types.ObjectId
    name: string
    price: number
    imageUrl: string
    description: string
    isActive?: boolean
}


const ProductSchema = new mongoose.Schema<IProduct>({
    categoryID: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        min: [2, "Product name must be at least 2 characters long"]
    },
    price: {
        type: Number,
        required: true,
        min: [0, "Product price must be at least 0"]
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export const Product = mongoose.model<IProduct>("Product", ProductSchema);