import { Router } from "express";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized, requirePermission } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";

import { getCategories } from "./category-controllers/get-categories";
import { getCategory } from "./category-controllers/get-category";
import { addCategory, addCategoryValidation } from "./category-controllers/add-category";
import { updateCategory } from "./category-controllers/update-category";
import { deactiviteCategory } from "./category-controllers/deactivite-category";

const router = Router();

router.get("/", getCategories);

router.get("/:id", getCategory);

router.post(
    "/",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    requirePermission("manage_categories", "manage_products"),
    addCategoryValidation,
    handleValidationErrors,
    addCategory
);


router.put(
    "/:id",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    requirePermission("manage_categories", "manage_products"),
    updateCategory
);

router.patch(
    "/:id/deactivate",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    requirePermission("manage_categories", "manage_products"),
    deactiviteCategory
);

export default router;