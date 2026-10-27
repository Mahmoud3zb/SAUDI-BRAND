import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { addToCart } from "./cart-controllers/add-to-cart";
import { getCart } from "./cart-controllers/get-cart";
import { removeFromCart } from "./cart-controllers/remove-from-cart";
import { clearCart } from "./cart-controllers/clear-cart";



const router = Router();

router.use(isAuthenticated)

router.post("/",addToCart)

router.get("/",getCart)

router.delete("/:productID",removeFromCart)

router.delete("/",clearCart)



export const cartRouter = router