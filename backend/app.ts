import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import userRouter from "./src/user/user-router";
import authRouter from "./src/auth/auth-router";
import productRouter from "./src/product/product-router";
import categoryRouter from "./src/category/category-router";
// import cors from "cors";
// import helmet from "helmet";

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

mongoose
    .connect(URI, {
        dbName: DB_NAME
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

// app.use(helmet());


const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL.replace(/\/$/, ""), "http://localhost:5173", "http://localhost:3000"]
    : ["http://localhost:5173", "http://localhost:3000"];

// app.use(
//     cors({
//         origin: (origin, callback) => {
//             if (!origin || allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             } else {
//                 callback(new Error("Not allowed by CORS"));
//             }
//         },
//         methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//         allowedHeaders: ["Content-Type", "Authorization", "X-Skip-Auth-Redirect", "x-skip-auth-redirect"]
//     })
// );

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
// API Routes

app.use("/api/user",userRouter)
app.use("/api/auth",authRouter)
app.use("/api/category",categoryRouter)
app.use("/api/product",productRouter)

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