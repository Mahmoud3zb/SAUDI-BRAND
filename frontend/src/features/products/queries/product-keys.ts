export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  byCategory: (categoryId: string) => [...productKeys.lists(), { categoryId }] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
}

export const bannerKeys = {
  all: ['banners'] as const,
}
