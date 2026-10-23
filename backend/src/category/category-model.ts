import mongoose from "mongoose";

interface ICategory {
    name: string;
    description?: string;
    isActive?: boolean;
}

const CategorySchema = new mongoose.Schema<ICategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        min: [2, "Category name must be at least 2 characters long"]
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