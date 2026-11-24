import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Expense } from "../expense-model";

export const getExpenses: RequestHandler = async (req, res, next) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const category = req.query.category as string | undefined;
        const search = req.query.search as string | undefined;

        const filter: any = {};
        if (category && category !== "all") {
            filter.category = category;
        }
        if (search && search.trim()) {
            filter.title = { $regex: search.trim(), $options: "i" };
        }

        const skip = (page - 1) * limit;

        const [expenses, total] = await Promise.all([
            Expense.find(filter)
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("createdBy", "name email"),
            Expense.countDocuments(filter)
        ]);

        return res.status(StatusCodes.OK).json({
            data: expenses,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit) || 1
            }
        });
    } catch (err) {
        next(err);
    }
};

export const createExpense: RequestHandler = async (req, res, next) => {
    try {
        const { title, amount, category = "other", date, notes } = req.body;

        if (!title || !title.trim()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "يرجى إدخال بيان أو اسم المصروف"
            });
        }

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount < 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "قيمة المصروف يجب أن تكون رقماً موجباً"
            });
        }

        const expense = await Expense.create({
            title: title.trim(),
            amount: numAmount,
            category,
            date: date ? new Date(date) : new Date(),
            notes: notes ? notes.trim() : undefined,
            createdBy: req.user?.id
        });

        return res.status(StatusCodes.CREATED).json({
            message: "تم تسجيل المصروف بنجاح",
            data: expense
        });
    } catch (err) {
        next(err);
    }
};

export const deleteExpense: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "المصروف غير موجود أو تم حذفه مسبقاً"
            });
        }

        return res.status(StatusCodes.OK).json({
            message: "تم حذف المصروف بنجاح"
        });
    } catch (err) {
        next(err);
    }
};

