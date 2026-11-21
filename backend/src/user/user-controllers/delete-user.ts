import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { User } from "../user-model";

export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "المستخدم غير موجود",
            });
        }

        // Prevent deleting the primary superadmin
        if (targetUser.email === "admin@saudibrand.com") {
            return res.status(StatusCodes.FORBIDDEN).json({
                message: "لا يمكن حذف حساب الإدارة الرئيسي للمتجر",
            });
        }

        // Prevent self-deletion
        const currentUserId = (req as any).user?.id || (req as any).user?._id;
        if (currentUserId && String(currentUserId) === String(targetUser._id)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "لا يمكنك حذف حسابك الحالي أثناء تسجيل الدخول منه",
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(StatusCodes.OK).json({
            message: "تم حذف المشرف بنجاح",
            data: { id },
        });
    } catch (err) {
        next(err);
    }
};

