import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
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
    body("permissions").optional().isArray().withMessage("Permissions must be an array of strings"),
]

interface IRequest {
    name: string;
    email: string;
    password: string;
    role?: Role;
    permissions?: string[];
}

interface IResponse {
    message: string;
    data?: unknown;
}
export const addUser: RequestHandler<{}, IResponse, IRequest> = async (
    req,
    res,
    next
) => {
    try {
        const { name, email, password, role, permissions } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({
                message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || Role.ADMIN,
            permissions: Array.isArray(permissions) ? permissions : [],
        });

        const userObj = user.toObject();
        const { password: _, ...userWithoutPassword } = userObj;

        return res.status(StatusCodes.CREATED).json({
            message: "User created successfully",
            data: userWithoutPassword
        });
    } catch (err) {
        next(err);
    }
};