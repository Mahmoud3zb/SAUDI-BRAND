export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl?: string
  mobileImageUrl?: string
  linkUrl?: string
  badge?: string
  textPosition?: 'left' | 'right'
  calloutText?: string
}
