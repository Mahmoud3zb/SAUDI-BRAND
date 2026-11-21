import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import { body } from "express-validator";
import { Role, User } from "../user/user-model";
import { jwtService } from "../services/jwt-service";

export const loginValidation = [
        body("email")
                .trim()
                .notEmpty().withMessage("Email is required")
                .isEmail().withMessage("Invalid email format"),
        body("password")
                .notEmpty().withMessage("Password is required"),
];

// export const COOKIE_OPTIONS = {
//         httpOnly: true,
//         sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
//         secure: process.env.NODE_ENV === "production",
//         path: "/",
// };

const isProduction = process.env.NODE_ENV === "production";

export const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    secure: isProduction,
    path: "/",
};

export const loginHandler: RequestHandler = async (req, res, next) => {
        try {
                const { email, password } = req.body;

                const user = await User.findOne({ email }).select("+password").exec();

                if (!user || !user.password) {
                        return res.status(401).json({ message: "Invalid email or password" });
                }

                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                        return res.status(401).json({ message: "Invalid email or password" });
                }

                const isSuper = user.role === Role.SUPER_ADMIN || user.email === "admin@saudibrand.com";
                const userPermissions = isSuper
                        ? ["manage_products", "manage_categories", "manage_orders", "view_overview", "manage_admins"]
                        : (user.permissions || []);

                const token = jwtService.createToken(
                        {
                                id: user._id,
                                email: user.email,
                                role: isSuper ? Role.SUPER_ADMIN : user.role,
                                permissions: userPermissions,
                        },
                        { expiresIn: "7d" }
                );

                const refreshToken = jwtService.createToken(
                        {
                                id: user._id,
                                email: user.email,
                                role: isSuper ? Role.SUPER_ADMIN : user.role,
                                permissions: userPermissions,
                        },
                        { expiresIn: "30d" }
                );

                res.cookie("token", token, {
                        ...COOKIE_OPTIONS,
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                res.cookie("refreshToken", refreshToken, {
                        ...COOKIE_OPTIONS,
                        maxAge: 30 * 24 * 60 * 60 * 1000,
                });

                const userObj = user.toObject();
                const { password: _, ...userWithoutPassword } = userObj;

                return res.status(200).json({
                        message: "Logged in successfully",
                        token,
                        user: {
                                ...userWithoutPassword,
                                role: isSuper ? Role.SUPER_ADMIN : user.role,
                                permissions: userPermissions,
                        }
                });
        } catch (err) {
                next(err);
        }
};