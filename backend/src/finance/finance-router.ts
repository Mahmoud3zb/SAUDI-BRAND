import { Router } from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.middleware";
import { requirePermission } from "../middlewares/isAuthorized.middleware";
import { getFinanceSummary } from "./finance-controllers/get-finance-summary";
import {
    getExpenses,
    createExpense,
    deleteExpense
} from "./finance-controllers/expense-controllers";
import {
    getWasteRecords,
    createWaste,
    deleteWaste
} from "./finance-controllers/waste-controllers";

export const financeRouter = Router();

// Protect all finance routes: must be authenticated and have permission
financeRouter.use(isAuthenticated, requirePermission("view_overview", "manage_finance"));

// Analytics Summary
financeRouter.get("/summary", getFinanceSummary);

// Expenses CRUD
financeRouter.get("/expenses", getExpenses);
financeRouter.post("/expenses", createExpense);
financeRouter.delete("/expenses/:id", deleteExpense);

// Waste CRUD
financeRouter.get("/waste", getWasteRecords);
financeRouter.post("/waste", createWaste);
financeRouter.delete("/waste/:id", deleteWaste);

