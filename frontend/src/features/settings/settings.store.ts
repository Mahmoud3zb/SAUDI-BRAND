import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { settingsApi, type ContactChannels, type ShippingRates, type StoreSettingsData } from './api/settings.api.ts'

const DEFAULT_CHANNELS: ContactChannels = {
  orders: { number: '01006488707', intl: '201006488707' },
  support: { number: '01006488707', intl: '201006488707' },
  wallet: { number: '01006488707', intl: '201006488707', accountName: 'سعودي براند' },
  advisor: { number: '01006488707', intl: '201006488707' },
}

interface SettingsState {
  whatsappNumber: string
  whatsappNumberIntl: string
  contactChannels: ContactChannels
  storeName: string
  announcementText: string
  isAnnouncementEnabled: boolean
  announcementLink: string
  shippingRates: ShippingRates
  freeShippingThreshold: number
  isLoaded: boolean
  isLoading: boolean
  fetchSettings: () => Promise<void>
  updateSettings: (payload: Partial<StoreSettingsData>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      whatsappNumber: '01006488707',
      whatsappNumberIntl: '201006488707',
      contactChannels: DEFAULT_CHANNELS,
      storeName: 'سعودي براند',
      announcementText: 'توصيل لجميع محافظات مصر • معاينة قبل الاستلام • عطور وعناية أصلية 100%',
      isAnnouncementEnabled: true,
      announcementLink: '/products',
      shippingRates: {
        cairoGiza: 100,
        delta: 80,
        said: 60,
      },
      freeShippingThreshold: 0,
      isLoaded: false,
      isLoading: false,

      fetchSettings: async () => {
        try {
          set({ isLoading: true })
          const res = await settingsApi.getPublicSettings()
          if (res?.data) {
            const data = res.data
            const rootNum = data.whatsappNumber || get().whatsappNumber
            const rootIntl = data.whatsappNumberIntl || get().whatsappNumberIntl

            const channels: ContactChannels = {
              orders: data.contactChannels?.orders || { number: rootNum, intl: rootIntl },
              support: data.contactChannels?.support || { number: rootNum, intl: rootIntl },
              wallet: data.contactChannels?.wallet || { number: rootNum, intl: rootIntl, accountName: 'سعودي براند' },
              advisor: data.contactChannels?.advisor || { number: rootNum, intl: rootIntl },
            }

            set({
              whatsappNumber: rootNum,
              whatsappNumberIntl: rootIntl,
              contactChannels: channels,
              storeName: data.storeName || get().storeName,
              announcementText: data.announcementText ?? get().announcementText,
              isAnnouncementEnabled: data.isAnnouncementEnabled ?? get().isAnnouncementEnabled,
              announcementLink: data.announcementLink ?? get().announcementLink,
              shippingRates: data.shippingRates ?? get().shippingRates,
              freeShippingThreshold: data.freeShippingThreshold ?? get().freeShippingThreshold,
              isLoaded: true,
              isLoading: false,
            })
          }
        } catch {
          set({ isLoaded: true, isLoading: false })
        }
      },

      updateSettings: async (payload: Partial<StoreSettingsData>) => {
        set({ isLoading: true })
        try {
          const res = await settingsApi.updateSettings(payload)
          if (res?.data) {
            const data = res.data
            const rootNum = data.whatsappNumber || get().whatsappNumber
            const rootIntl = data.whatsappNumberIntl || get().whatsappNumberIntl

            const channels: ContactChannels = {
              orders: data.contactChannels?.orders || get().contactChannels.orders,
              support: data.contactChannels?.support || get().contactChannels.support,
              wallet: data.contactChannels?.wallet || get().contactChannels.wallet,
              advisor: data.contactChannels?.advisor || get().contactChannels.advisor,
            }

            set({
              whatsappNumber: rootNum,
              whatsappNumberIntl: rootIntl,
              contactChannels: channels,
              storeName: data.storeName || get().storeName,
              announcementText: data.announcementText ?? get().announcementText,
              isAnnouncementEnabled: data.isAnnouncementEnabled ?? get().isAnnouncementEnabled,
              announcementLink: data.announcementLink ?? get().announcementLink,
              shippingRates: data.shippingRates ?? get().shippingRates,
              freeShippingThreshold: data.freeShippingThreshold ?? get().freeShippingThreshold,
              isLoading: false,
            })
          }
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'saudi_brand_settings',
    }
  )
)
