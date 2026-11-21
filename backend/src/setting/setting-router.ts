import { Router } from "express";
import { getPublicSettings } from "./setting-controllers/get-settings";
import { updateSettings, updateSettingsValidation } from "./setting-controllers/update-settings";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized, requirePermission } from "../middlewares/isAuthorized.middleware";
import { Role } from "../user/user-model";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";

const router = Router();

// Public endpoint for storefront visitors to get active WhatsApp number
router.get("/public", getPublicSettings);

// Protected endpoint for admins to update WhatsApp number
router.put(
    "/",
    isAuthenticated,
    isAuthorized(Role.ADMIN),
    requirePermission("manage_settings"),
    updateSettingsValidation,
    handleValidationErrors,
    updateSettings
);

export default router;

