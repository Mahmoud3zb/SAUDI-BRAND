import mongoose from "mongoose";

interface Iitem {
    productID: mongoose.Types.ObjectId;
    quantity: number;
}


export interface ICart {
    userID: mongoose.Types.ObjectId;
    items: Iitem[];
}

const CartSchema = new mongoose.Schema<ICart>({
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
        ], required: true,
        default: []
    },

}, {
    timestamps: true
});

export const Cart = mongoose.model<ICart>("Cart", CartSchema);