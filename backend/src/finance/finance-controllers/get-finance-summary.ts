import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Order, Status } from "../../order/order-model";
import { Product } from "../../product/product-model";
import { Expense } from "../expense-model";
import { Waste } from "../waste-model";

const ARABIC_MONTHS = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر"
];

function resolveDateRange(period: string, from?: string, to?: string) {
    const now = new Date();

    if (period === "daily") {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const prevStart = new Date(start);
        prevStart.setDate(prevStart.getDate() - 1);
        const prevEnd = new Date(end);
        prevEnd.setDate(prevEnd.getDate() - 1);

        return { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd, label: "اليوم" };
    }

    if (period === "monthly") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        return {
            startDate: start,
            endDate: end,
            prevStartDate: prevStart,
            prevEndDate: prevEnd,
            label: `شهر ${ARABIC_MONTHS[now.getMonth()]} ${now.getFullYear()}`
        };
    }

    if (period === "yearly") {
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

        const prevStart = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
        const prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);

        return {
            startDate: start,
            endDate: end,
            prevStartDate: prevStart,
            prevEndDate: prevEnd,
            label: `سنة ${now.getFullYear()}`
        };
    }

    // Default: Custom Date Range
    const start = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    const end = to ? new Date(to) : new Date();
    end.setHours(23, 59, 59, 999);

    const duration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(start.getTime() - 1);

    const fromStr = start.toLocaleDateString("ar-EG");
    const toStr = end.toLocaleDateString("ar-EG");

    return {
        startDate: start,
        endDate: end,
        prevStartDate: prevStart,
        prevEndDate: prevEnd,
        label: `الفترة من ${fromStr} إلى ${toStr}`
    };
}

async function calculatePeriodMetrics(startDate: Date, endDate: Date) {
    // 1. Fetch relevant orders
    const orders = await Order.find({
        status: { $in: [Status.COMPLETED, Status.CONFIRMED] },
        createdAt: { $gte: startDate, $lte: endDate }
    }).populate("items.productID", "costPrice name");

    let grossRevenue = 0;
    let shippingRevenue = 0;
    let totalCOGS = 0;
    let totalItemsSold = 0;

    for (const order of orders) {
        grossRevenue += order.totalPrice || 0;
        shippingRevenue += order.shippingFee || 0;

        for (const it of order.items || []) {
            totalItemsSold += it.quantity;
            let unitCost = it.costPrice;
            if (unitCost === undefined || unitCost === null || unitCost === 0) {
                const prod = it.productID as any;
                unitCost = prod?.costPrice || 0;
            }
            totalCOGS += (unitCost || 0) * it.quantity;
        }
    }

    const netProductRevenue = Math.max(0, grossRevenue - shippingRevenue);
    const grossProfit = grossRevenue - totalCOGS;

    // 2. Fetch expenses
    const expenses = await Expense.find({
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    const expensesByCategory: Record<string, number> = {
        ads: 0,
        packaging: 0,
        salaries: 0,
        shipping: 0,
        rent: 0,
        utilities: 0,
        other: 0
    };
    for (const exp of expenses) {
        const cat = exp.category || "other";
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + exp.amount;
    }

    // 3. Fetch waste
    const wasteRecords = await Waste.find({
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    const totalWaste = wasteRecords.reduce((sum, w) => sum + (w.totalCost || 0), 0);
    const totalWasteQuantity = wasteRecords.reduce((sum, w) => sum + (w.quantity || 0), 0);

    const wasteByReason: Record<string, number> = {
        shipping_damage: 0,
        manufacturing_defect: 0,
        tester_sample: 0,
        storage_loss: 0,
        other: 0
    };
    for (const w of wasteRecords) {
        const r = w.reason || "other";
        wasteByReason[r] = (wasteByReason[r] || 0) + w.totalCost;
    }

    // 4. Net Profit calculation
    const netProfit = grossProfit - totalExpenses - totalWaste;
    const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    return {
        grossRevenue,
        shippingRevenue,
        netProductRevenue,
        totalCOGS,
        grossProfit,
        ordersCount: orders.length,
        totalItemsSold,
        totalExpenses,
        expensesByCategory,
        expensesList: expenses.slice(0, 10),
        totalWaste,
        totalWasteQuantity,
        wasteByReason,
        wasteList: wasteRecords.slice(0, 10),
        netProfit,
        profitMargin: Number(profitMargin.toFixed(1))
    };
}

export const getFinanceSummary: RequestHandler = async (req, res, next) => {
    try {
        const period = String(req.query.period || "daily").toLowerCase();
        const from = req.query.from as string | undefined;
        const to = req.query.to as string | undefined;

        const { startDate, endDate, prevStartDate, prevEndDate, label } = resolveDateRange(period, from, to);

        // Run current period & previous period metrics concurrently for speed
        const [currentMetrics, prevMetrics] = await Promise.all([
            calculatePeriodMetrics(startDate, endDate),
            calculatePeriodMetrics(prevStartDate, prevEndDate)
        ]);

        // Calculate comparison trends (%)
        const revenueGrowth = prevMetrics.grossRevenue > 0
            ? Number((((currentMetrics.grossRevenue - prevMetrics.grossRevenue) / prevMetrics.grossRevenue) * 100).toFixed(1))
            : currentMetrics.grossRevenue > 0 ? 100 : 0;

        const netProfitGrowth = prevMetrics.netProfit !== 0
            ? Number((((currentMetrics.netProfit - prevMetrics.netProfit) / Math.abs(prevMetrics.netProfit)) * 100).toFixed(1))
            : currentMetrics.netProfit > 0 ? 100 : 0;

        // If yearly, construct a 12-month series for interactive graphs
        let monthlyChart: Array<{
            monthIndex: number;
            monthName: string;
            revenue: number;
            cogs: number;
            expenses: number;
            waste: number;
            netProfit: number;
        }> = [];

        if (period === "yearly") {
            const currentYear = startDate.getFullYear();
            const monthsPromises = Array.from({ length: 12 }, async (_, m) => {
                const mStart = new Date(currentYear, m, 1, 0, 0, 0, 0);
                const mEnd = new Date(currentYear, m + 1, 0, 23, 59, 59, 999);
                const mMetrics = await calculatePeriodMetrics(mStart, mEnd);
                return {
                    monthIndex: m + 1,
                    monthName: ARABIC_MONTHS[m],
                    revenue: mMetrics.grossRevenue,
                    cogs: mMetrics.totalCOGS,
                    expenses: mMetrics.totalExpenses,
                    waste: mMetrics.totalWaste,
                    netProfit: mMetrics.netProfit
                };
            });
            monthlyChart = await Promise.all(monthsPromises);
        }

        return res.status(StatusCodes.OK).json({
            period,
            label,
            dateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            },
            current: currentMetrics,
            previous: {
                grossRevenue: prevMetrics.grossRevenue,
                netProfit: prevMetrics.netProfit,
                totalExpenses: prevMetrics.totalExpenses,
                totalWaste: prevMetrics.totalWaste
            },
            trends: {
                revenueGrowth,
                netProfitGrowth
            },
            monthlyChart
        });
    } catch (err) {
        next(err);
    }
};
