import { Router } from "express";
import { createOrder, createOrderValidation } from "./order-controllers/create-order";
import { getOrders } from "./order-controllers/get-orders";
import { getMyOrders } from "./order-controllers/get-my-orders";
import { getOrder } from "./order-controllers/get-order";
import { isAuthenticated, optionalAuth } from "../middlewares/isAuthenticated.middleware";
import { updateOrderStatus, updateOrderStatusValidation } from "./order-controllers/update-order-status";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";

const router = Router();

// Place order - Open to both guests and logged-in customers
router.post("/", optionalAuth, createOrderValidation, handleValidationErrors, createOrder);

// Authenticated routes
router.get("/orders", isAuthenticated, isAuthorized(Role.ADMIN), getOrders);
router.get("/my-orders", isAuthenticated, getMyOrders);
router.get("/order/:id", isAuthenticated, getOrder);
router.put(
    "/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    updateOrderStatusValidation,
    handleValidationErrors,
    updateOrderStatus
);

export default router;