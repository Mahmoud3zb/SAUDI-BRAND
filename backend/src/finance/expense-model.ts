import mongoose from "mongoose";

export type ExpenseCategory =
    | "ads"
    | "packaging"
    | "salaries"
    | "shipping"
    | "rent"
    | "utilities"
    | "other";

export interface IExpense {
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: Date;
    notes?: string;
    createdBy?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const ExpenseSchema = new mongoose.Schema<IExpense>(
    {
        title: {
            type: String,
            required: [true, "عنوان / بيان المصروف مطلوب"],
            trim: true,
            minlength: [2, "يجب أن يكون العنوان حرفين على الأقل"],
        },
        amount: {
            type: Number,
            required: [true, "قيمة المصروف مطلوبة"],
            min: [0, "المبلغ يجب أن يكون رقماً موجباً"],
        },
        category: {
            type: String,
            required: true,
            enum: ["ads", "packaging", "salaries", "shipping", "rent", "utilities", "other"],
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

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });

export const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);

