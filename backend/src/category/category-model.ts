import mongoose from "mongoose";

export interface ICategory {
    name: string;
    slug?: string;
    description?: string;
    isActive?: boolean;
}

const CategorySchema = new mongoose.Schema<ICategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [2, "Category name must be at least 2 characters long"]
    },
    slug: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
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

export const Category = mongoose.model<ICategory>("Category", CategorySchema);