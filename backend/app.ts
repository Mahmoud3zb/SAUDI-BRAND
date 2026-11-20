import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import userRouter from "./src/user/user-router";
import authRouter from "./src/auth/auth-router";
import productRouter from "./src/product/product-router";
import categoryRouter from "./src/category/category-router";
import cors from "cors";
import helmet from "helmet";
import { cartRouter } from "./src/cart/cart-router";
import orderRouter from "./src/order/order-router";
import bcrypt from "bcrypt";
import { User, Role } from "./src/user/user-model";

// Routers

dotenv.config();
const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3000;
const URI = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

if (!URI || !DB_NAME) {
    console.error("FATAL ERROR: DB_URL or DB_NAME is not defined in .env");
    process.exit(1);
}

async function ensureAdminUser() {
    try {
        const adminEmail = "admin@saudibrand.com";
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
            await User.create({
                name: "مدير سعودي براند",
                email: adminEmail,
                password: hashedPassword,
                role: Role.ADMIN
            });
            console.log("✅ Admin user ready: admin@saudibrand.com / admin123");
        } else {
            const matches = await bcrypt.compare("admin123", existing.password);
            if (!matches || existing.role !== Role.ADMIN) {
                existing.password = hashedPassword;
                existing.role = Role.ADMIN;
                await existing.save();
                console.log("✅ Admin user password reset to admin123");
            }
        }
    } catch (e) {
        console.error("Failed to ensure admin user:", e);
    }
}

mongoose
    .connect(URI, {
        dbName: DB_NAME
    })
    .then(async () => {
        console.log("MongoDB connected successfully");
        await ensureAdminUser();
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

app.use(helmet());


const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL.replace(/\/$/, ""), "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
    : ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: (origin, callback) => {
            const isVercel = origin ? /\.vercel\.app$/i.test(origin) : false;
            const isLocal = origin ? (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) : false;
            
            if (!origin || allowedOrigins.includes(origin) || isVercel || isLocal) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Skip-Auth-Redirect", "x-skip-auth-redirect"]
    })
);

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
// API Routes

app.use("/api/user",userRouter)
app.use("/api/auth",authRouter)
app.use("/api/category",categoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)

app.get('/', (req, res) => {
    res.status(200).send('SAUDI-BRAND API is running');
})

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error Handler:", err);

    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === "production" 
            ? "Internal Server Error" 
            : err.message,
    });
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});


process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(async () => {
        console.log("HTTP server closed.");
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
    });
});