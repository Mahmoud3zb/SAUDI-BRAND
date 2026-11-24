import mongoose from "mongoose";

export type WasteReason =
    | "shipping_damage"
    | "manufacturing_defect"
    | "tester_sample"
    | "storage_loss"
    | "other";

export interface IWaste {
    productID?: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    costPerUnit: number;
    totalCost: number;
    reason: WasteReason;
    date: Date;
    notes?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const WasteSchema = new mongoose.Schema<IWaste>(
    {
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },
        productName: {
            type: String,
            required: [true, "اسم المنتج التالف / الهالك مطلوب"],
            trim: true,
        },
        quantity: {
            type: Number,
            required: [true, "الكمية التالفة مطلوبة"],
            min: [1, "الكمية يجب أن تكون 1 على الأقل"],
        },
        costPerUnit: {
            type: Number,
            required: [true, "تكلفة القطعة الواحدة مطلوبة"],
            min: [0, "التكلفة يجب أن تكون رقماً موجباً"],
        },
        totalCost: {
            type: Number,
            required: [true, "إجمالي تكلفة الهالك مطلوب"],
            min: [0, "إجمالي التكلفة يجب أن يكون رقماً موجباً"],
        },
        reason: {
            type: String,
            required: true,
            enum: ["shipping_damage", "manufacturing_defect", "tester_sample", "storage_loss", "other"],
            default: "other",
        },
        date: {
            type: Date,
            default: Date.now,
            required: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

WasteSchema.index({ date: -1 });
WasteSchema.index({ reason: 1 });

export const Waste = mongoose.model<IWaste>("Waste", WasteSchema);

