import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { body } from "express-validator";
import mongoose from "mongoose";
import { getOrCreateSettings, normalizeEgyptianPhone, Setting } from "../setting-model";

const phoneRegex = /^(?:\+?20|0020)?0?1[0125][0-9]{8}$/;

export const updateSettingsValidation = [
    body("whatsappNumber")
        .optional()
        .trim()
        .matches(phoneRegex).withMessage("يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678)"),
    body("contactChannels.orders.number").optional().trim().matches(phoneRegex).withMessage("رقم طلبات العملاء غير صالح"),
    body("contactChannels.support.number").optional().trim().matches(phoneRegex).withMessage("رقم خدمة العملاء غير صالح"),
    body("contactChannels.wallet.number").optional().trim().matches(phoneRegex).withMessage("رقم محفظة التحويل غير صالح"),
    body("contactChannels.wallet.accountName").optional().trim().isLength({ max: 80 }),
    body("contactChannels.advisor.number").optional().trim().matches(phoneRegex).withMessage("رقم خبير الاستشارات غير صالح"),
    body("storeName").optional().trim().isLength({ min: 2, max: 100 }),
    body("announcementText").optional().trim(),
    body("isAnnouncementEnabled").optional().isBoolean(),
    body("announcementLink").optional().trim(),
    body("shippingRates.cairoGiza").optional().isFloat({ min: 0 }),
    body("shippingRates.delta").optional().isFloat({ min: 0 }),
    body("shippingRates.said").optional().isFloat({ min: 0 }),
    body("freeShippingThreshold").optional().isFloat({ min: 0 }),
];

export const updateSettings: RequestHandler = async (req, res, next) => {
    try {
        const {
            whatsappNumber,
            contactChannels,
            storeName,
            announcementText,
            isAnnouncementEnabled,
            announcementLink,
            shippingRates,
            freeShippingThreshold
        } = req.body;
        const userId = req.user?.id;

        const setting = await getOrCreateSettings();

        // 1. Process Channels or legacy whatsappNumber
        const legacyPhone = whatsappNumber ? normalizeEgyptianPhone(whatsappNumber) : null;
        if (legacyPhone) {
            setting.whatsappNumber = legacyPhone.local;
            setting.whatsappNumberIntl = legacyPhone.intl;
        }

        if (contactChannels && typeof contactChannels === "object") {
            if (!setting.contactChannels) {
                setting.contactChannels = {
                    orders: { number: setting.whatsappNumber, intl: setting.whatsappNumberIntl },
                    support: { number: setting.whatsappNumber, intl: setting.whatsappNumberIntl },
                    wallet: { number: setting.whatsappNumber, intl: setting.whatsappNumberIntl, accountName: "سعودي براند" },
                    advisor: { number: setting.whatsappNumber, intl: setting.whatsappNumberIntl },
                };
            }

            // Orders Channel
            if (contactChannels.orders?.number) {
                const norm = normalizeEgyptianPhone(contactChannels.orders.number);
                setting.contactChannels.orders = { number: norm.local, intl: norm.intl };
                // Keep root whatsappNumber in sync with orders channel
                setting.whatsappNumber = norm.local;
                setting.whatsappNumberIntl = norm.intl;
            } else if (legacyPhone) {
                setting.contactChannels.orders = { number: legacyPhone.local, intl: legacyPhone.intl };
            }

            // Support Channel
            if (contactChannels.support?.number) {
                const norm = normalizeEgyptianPhone(contactChannels.support.number);
                setting.contactChannels.support = { number: norm.local, intl: norm.intl };
            }

            // Wallet Channel
            if (contactChannels.wallet?.number) {
                const norm = normalizeEgyptianPhone(contactChannels.wallet.number);
                setting.contactChannels.wallet = {
                    number: norm.local,
                    intl: norm.intl,
                    accountName: typeof contactChannels.wallet.accountName === "string" 
                        ? contactChannels.wallet.accountName.trim() 
                        : (setting.contactChannels.wallet?.accountName || "سعودي براند"),
                };
            } else if (typeof contactChannels.wallet?.accountName === "string") {
                setting.contactChannels.wallet.accountName = contactChannels.wallet.accountName.trim();
            }

            // Advisor Channel
            if (contactChannels.advisor?.number) {
                const norm = normalizeEgyptianPhone(contactChannels.advisor.number);
                setting.contactChannels.advisor = { number: norm.local, intl: norm.intl };
            }
        }

        if (storeName && typeof storeName === "string" && storeName.trim()) {
            setting.storeName = storeName.trim();
        }
        if (typeof announcementText === "string") {
            setting.announcementText = announcementText.trim();
        }
        if (typeof isAnnouncementEnabled === "boolean") {
            setting.isAnnouncementEnabled = isAnnouncementEnabled;
        }
        if (typeof announcementLink === "string") {
            setting.announcementLink = announcementLink.trim();
        }
        if (shippingRates && typeof shippingRates === "object") {
            if (typeof shippingRates.cairoGiza === "number") setting.shippingRates.cairoGiza = shippingRates.cairoGiza;
            if (typeof shippingRates.delta === "number") setting.shippingRates.delta = shippingRates.delta;
            if (typeof shippingRates.said === "number") setting.shippingRates.said = shippingRates.said;
        }
        if (typeof freeShippingThreshold === "number") {
            setting.freeShippingThreshold = freeShippingThreshold;
        }
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            setting.updatedBy = new mongoose.Types.ObjectId(userId);
        }

        setting.markModified("contactChannels");
        setting.markModified("shippingRates");

        const updatedSetting = await Setting.findByIdAndUpdate(
            setting._id,
            {
                $set: {
                    whatsappNumber: setting.whatsappNumber,
                    whatsappNumberIntl: setting.whatsappNumberIntl,
                    contactChannels: setting.contactChannels,
                    storeName: setting.storeName,
                    announcementText: setting.announcementText,
                    isAnnouncementEnabled: setting.isAnnouncementEnabled,
                    announcementLink: setting.announcementLink,
                    shippingRates: setting.shippingRates,
                    freeShippingThreshold: setting.freeShippingThreshold,
                    ...(setting.updatedBy ? { updatedBy: setting.updatedBy } : {}),
                },
            },
            { new: true, runValidators: true }
        );

        const finalSetting = updatedSetting || setting;

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "تم حفظ وتحديث إعدادات وأرقام المتجر بنجاح",
            data: {
                whatsappNumber: finalSetting.whatsappNumber,
                whatsappNumberIntl: finalSetting.whatsappNumberIntl,
                contactChannels: finalSetting.contactChannels,
                storeName: finalSetting.storeName,
                announcementText: finalSetting.announcementText,
                isAnnouncementEnabled: finalSetting.isAnnouncementEnabled,
                announcementLink: finalSetting.announcementLink,
                shippingRates: finalSetting.shippingRates,
                freeShippingThreshold: finalSetting.freeShippingThreshold,
                updatedAt: finalSetting.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

