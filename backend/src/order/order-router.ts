import { Router } from "express";
import { createOrder } from "./order-controllers/create-order";
import { getOrders } from "./order-controllers/get-orders";
import { getMyOrders } from "./order-controllers/get-my-orders";
import { getOrder } from "./order-controllers/get-order";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { updateOrderStatus, updateOrderStatusValidation } from "./order-controllers/update-order-status";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";


const router = Router();

router.use(isAuthenticated);


router.post("/", createOrder);


router.get(
    "/orders",
    isAuthorized(Role.ADMIN),
    getOrders
);


router.get("/my-orders", getMyOrders);


router.get("/order/:id", getOrder);


router.put(
    "/:id",
    isAuthorized(Role.ADMIN),
    updateOrderStatusValidation,
    handleValidationErrors,
    updateOrderStatus
);

export default router;