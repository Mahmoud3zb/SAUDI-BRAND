import { Router } from "express";
import { getUser } from "./user-controllers/get-user";
import { getUsers } from "./user-controllers/get-users";
import { addUser, addUserValidation } from "./user-controllers/add-user";
import { deleteUser } from "./user-controllers/delete-user";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { isAuthorized } from "../middlewares/isAuthorized.middleware";
import { handleValidationErrors } from "../middlewares/handleValidationErrors";
import { Role } from "./user-model";

const router = Router();

// Protect all user management endpoints - Super Admin only!
router.use(isAuthenticated, isAuthorized(Role.SUPER_ADMIN));

router.get("/", getUsers);
router.get("/:id", getUser);
router.post("/", addUserValidation, handleValidationErrors, addUser);
router.delete("/:id", deleteUser);

export default router;