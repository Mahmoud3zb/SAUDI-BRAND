import mongoose, { Document, Schema } from "mongoose";

export interface IShippingRates {
    cairoGiza: number;
    delta: number;
    said: number;
}

export interface IContactChannel {
    number: string;
    intl: string;
    accountName?: string;
}

export interface IContactChannels {
    orders: IContactChannel;
    support: IContactChannel;
    wallet: IContactChannel;
    advisor: IContactChannel;
}

export interface ISetting extends Document {
    whatsappNumber: string;
    whatsappNumberIntl: string;
    contactChannels: IContactChannels;
    storeName: string;
    announcementText: string;
    isAnnouncementEnabled: boolean;
    announcementLink?: string;
    shippingRates: IShippingRates;
    freeShippingThreshold: number;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export function normalizeEgyptianPhone(input: string): { local: string; intl: string } {
    let local = String(input || "").trim().replace(/[\s\-()]/g, "");
    if (local.startsWith("+20")) {
        local = "0" + local.slice(3);
    } else if (local.startsWith("0020")) {
        local = "0" + local.slice(4);
    } else if (local.length === 10 && /^[1][0125]/.test(local)) {
        local = "0" + local;
    }
    const intl = "2" + (local.startsWith("0") ? local : "0" + local);
    return { local, intl };
}

const SettingSchema = new Schema<ISetting>(
    {
        whatsappNumber: {
            type: String,
            required: true,
            default: "01006488707",
            trim: true,
        },
        whatsappNumberIntl: {
            type: String,
            required: true,
            default: "201006488707",
            trim: true,
        },
        contactChannels: {
            orders: {
                number: { type: String, default: "01006488707" },
                intl: { type: String, default: "201006488707" },
            },
            support: {
                number: { type: String, default: "01006488707" },
                intl: { type: String, default: "201006488707" },
            },
            wallet: {
                number: { type: String, default: "01006488707" },
                intl: { type: String, default: "201006488707" },
                accountName: { type: String, default: "سعودي براند" },
            },
            advisor: {
                number: { type: String, default: "01006488707" },
                intl: { type: String, default: "201006488707" },
            },
        },
        storeName: {
            type: String,
            default: "سعودي براند",
            trim: true,
        },
        announcementText: {
            type: String,
            default: "توصيل لجميع محافظات مصر • معاينة قبل الاستلام • عطور وعناية أصلية 100%",
            trim: true,
        },
        isAnnouncementEnabled: {
            type: Boolean,
            default: true,
        },
        announcementLink: {
            type: String,
            default: "/products",
            trim: true,
        },
        shippingRates: {
            cairoGiza: { type: Number, default: 100 },
            delta: { type: Number, default: 80 },
            said: { type: Number, default: 60 },
        },
        freeShippingThreshold: {
            type: Number,
            default: 0, // 0 means disabled
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);

/**
 * Returns the existing settings singleton or creates the default one.
 */
export async function getOrCreateSettings(): Promise<ISetting> {
    let setting = await Setting.findOne();
    if (!setting) {
        setting = await Setting.create({
            whatsappNumber: "01006488707",
            whatsappNumberIntl: "201006488707",
            contactChannels: {
                orders: { number: "01006488707", intl: "201006488707" },
                support: { number: "01006488707", intl: "201006488707" },
                wallet: { number: "01006488707", intl: "201006488707", accountName: "سعودي براند" },
                advisor: { number: "01006488707", intl: "201006488707" },
            },
            storeName: "سعودي براند",
            announcementText: "توصيل لجميع محافظات مصر • معاينة قبل الاستلام • عطور وعناية أصلية 100%",
            isAnnouncementEnabled: true,
            announcementLink: "/products",
            shippingRates: {
                cairoGiza: 100,
                delta: 80,
                said: 60,
            },
            freeShippingThreshold: 0,
        });
    }
    return setting;
}

