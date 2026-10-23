import { Router } from "express";
import { upload } from "../middlewares/upload";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { getProducts } from "./product-controllers/get-produts";
import { getProduct } from "./product-controllers/get-product";
import { addProduct, addProductValidation } from "./product-controllers/add-product";
import { updateProduct, updateProductValidation } from "./product-controllers/update-products";
import { changeProductStatus } from "./product-controllers/change-product-status";

const router = Router();


router.get("/", getProducts);

router.get("/:id", getProduct);

router.post(
    "/",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    upload.single("imageUrl"),
    addProductValidation,
    handleValidationErrors,
    addProduct
);


router.put(
    "/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    upload.single("imageUrl"),
    updateProductValidation,
    handleValidationErrors,
    updateProduct
);

router.patch(
    "/:id/status",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    changeProductStatus
);

export default router;