import { Router } from "express";
import { getUser } from "./user-controllers/get-user";
import { getUsers } from "./user-controllers/get-users";
import { addUser } from "./user-controllers/add-user";

const router = Router();

router.get("/",getUsers);
router.get("/:id",getUser);
router.post("/",addUser);


export default router;