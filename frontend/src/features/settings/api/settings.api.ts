import { apiClient } from '../../../lib/api-client.ts'

export interface ShippingRates {
  cairoGiza: number
  delta: number
  said: number
}

export interface ContactChannel {
  number: string
  intl: string
  accountName?: string
}

export interface ContactChannels {
  orders: ContactChannel
  support: ContactChannel
  wallet: ContactChannel
  advisor: ContactChannel
}

export interface StoreSettingsData {
  whatsappNumber: string
  whatsappNumberIntl: string
  contactChannels?: ContactChannels
  storeName?: string
  announcementText?: string
  isAnnouncementEnabled?: boolean
  announcementLink?: string
  shippingRates?: ShippingRates
  freeShippingThreshold?: number
  updatedAt?: string
}

export const settingsApi = {
  getPublicSettings: async () => {
    return apiClient<{ success: boolean; data: StoreSettingsData }>('/settings/public')
  },
  updateSettings: async (payload: Partial<StoreSettingsData>) => {
    return apiClient<{ success: boolean; message: string; data: StoreSettingsData }>('/settings', {
      method: 'PUT',
      data: payload,
    })
  },
}
