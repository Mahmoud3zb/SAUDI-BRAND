import mongoose from "mongoose";

interface Iitem {
    productID: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    costPrice?: number;
}

export enum Status {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

export interface IShippingAddress {
    city: string;
    district?: string;
    street: string;
    notes?: string;
}

export type PaymentMethod = "cod" | "vodafone_cash" | "instapay" | "card" | "tabby" | "tamara";
export type PaymentStatus = "unpaid" | "paid";

export interface IOrder {
    userID?: mongoose.Types.ObjectId;
    customerName: string;
    customerPhone: string;
    shippingAddress: IShippingAddress;
    items: Iitem[];
    totalPrice: number;
    shippingFee?: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new mongoose.Schema<IOrder>({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true
    },
    shippingAddress: {
        city: { type: String, required: true, trim: true },
        district: { type: String, trim: true },
        street: { type: String, required: true, trim: true },
        notes: { type: String, trim: true }
    },
    items: {
        type: [
            {
                productID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                },
                costPrice: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            }
        ],
        default: []
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, "Total price must be at least 0"]
    },
    shippingFee: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "vodafone_cash", "instapay", "card", "tabby", "tamara"],
        default: "cod"
    },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "paid"],
        default: "unpaid"
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.PENDING
    }
}, {
    timestamps: true
});

// Performance Indexes for fast queries, analytics, and customer lookups
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customerPhone: 1 });
OrderSchema.index({ userID: 1, createdAt: -1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);