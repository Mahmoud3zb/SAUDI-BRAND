import mongoose from "mongoose";

interface Iitem {
    productID: mongoose.Types.ObjectId;
    quantity: number;
}

enum Status {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}

interface IOrder{
    userID: mongoose.Types.ObjectId,
    items: Iitem[],
    totalPrice: number,
    status: Status,
    createdAt: Date,
    updatedAt: Date
}

const OrderSchema = new mongoose.Schema<IOrder>({
    userID: {
        type: mongoose.Types.ObjectId,
        required: true
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
                        min: [1, "Quantity must be at least 1"]
                    },
                }
            ],
            default: []
        },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, "Total price must be at least 0"]
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.PENDING
    }
}, {
    timestamps: true
});