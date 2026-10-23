import mongoose from "mongoose";

export enum Role{
    ADMIN = "admin",
    USER = "user"
}



interface IUser extends mongoose.Document {
    name:string,
    email:string,
    password:string,
    role?:Role
}


const UserShcema = new mongoose.Schema<IUser>({
    name:{
        type: String,
        required: true,
        trime: true
    },
    email:{
        type: String,
        required: true,
        trime: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        trime: true,
        minlength: [6, "Password must be at least 6 characters long"]
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    }
})

export const User = mongoose.model<IUser>("User", UserShcema);