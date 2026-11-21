import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { getOrCreateSettings } from "../setting-model";

export const getPublicSettings: RequestHandler = async (req, res, next) => {
    try {
        const settings = await getOrCreateSettings();

        const defaultChannel = {
            number: settings.whatsappNumber || "01006488707",
            intl: settings.whatsappNumberIntl || "201006488707",
        };

        const contactChannels = {
            orders: {
                number: settings.contactChannels?.orders?.number || defaultChannel.number,
                intl: settings.contactChannels?.orders?.intl || defaultChannel.intl,
            },
            support: {
                number: settings.contactChannels?.support?.number || defaultChannel.number,
                intl: settings.contactChannels?.support?.intl || defaultChannel.intl,
            },
            wallet: {
                number: settings.contactChannels?.wallet?.number || defaultChannel.number,
                intl: settings.contactChannels?.wallet?.intl || defaultChannel.intl,
                accountName: settings.contactChannels?.wallet?.accountName || "سعودي براند",
            },
            advisor: {
                number: settings.contactChannels?.advisor?.number || defaultChannel.number,
                intl: settings.contactChannels?.advisor?.intl || defaultChannel.intl,
            },
        };

        return res.status(StatusCodes.OK).json({
            success: true,
            data: {
                whatsappNumber: settings.whatsappNumber,
                whatsappNumberIntl: settings.whatsappNumberIntl,
                contactChannels,
                storeName: settings.storeName,
                announcementText: settings.announcementText,
                isAnnouncementEnabled: settings.isAnnouncementEnabled,
                announcementLink: settings.announcementLink,
                shippingRates: settings.shippingRates,
                freeShippingThreshold: settings.freeShippingThreshold,
                updatedAt: settings.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

