import mongoose from "mongoose";

export enum Role {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    USER = "user"
}

export interface IAddress {
    street?: string;
    city?: string;
    country?: string;
}

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role?: Role;
    permissions?: string[];
    address?: IAddress;
    profileImage?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, "Password must be at least 6 characters long"]
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    permissions: {
        type: [String],
        default: []
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        country: { type: String, trim: true }
    },
    profileImage: {
        type: String,
        default: ""
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    }
}, {
    timestamps: true
});

export const User = mongoose.model<IUser>("User", UserSchema);