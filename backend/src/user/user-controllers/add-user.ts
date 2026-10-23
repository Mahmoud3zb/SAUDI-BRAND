import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Role, User } from "../user-model";
import { body } from "express-validator";


export const addUserValidation = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("role").optional().isIn(Object.values(Role)).withMessage("Invalid role"),
]

interface IRequest{
    name: string;
    email: string;
    password: string;
    role?: Role
}

interface IResponse{
    message: string,
    data:unknown
}
export const addUser: RequestHandler<{},IResponse,IRequest> =
async (
    req,
    res,
    next
) => {
    try{
        const { name , email , password , role } = req.body;
        const user = await User.create({
            name,
            email,
            password,
            role
        });
        return res.status(StatusCodes.CREATED).json({
            message:"User created successfully",
            data:user
        });
    }catch(err){
        next(err);
    }
}