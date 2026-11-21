const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  data?: unknown
}

function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem('saudi_brand_admin_auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.state?.token || null
    }
  } catch {
    // ignore parse error
  }
  return null
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers = {}, ...customConfig } = options

  const isFormData = data instanceof FormData
  const token = getStoredToken()

  const authHeaders: Record<string, string> = {}
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders,
      ...headers,
    },
    credentials: 'include', // Automatically send and receive cookies from backend
  }

  if (data) {
    config.body = isFormData ? data : JSON.stringify(data)
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, config)

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`
    try {
      const errorData = await response.json()
      if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors.map((e: { message?: string }) => e.message || '').filter(Boolean).join(' - ') || errorData.message || errorMessage
      } else if (errorData?.message) {
        errorMessage = errorData.message
      }
    } catch {
      // ignore json parse error
    }

    if (response.status === 401) {
      try {
        localStorage.removeItem('saudi_brand_admin_auth')
      } catch {
        // ignore
      }
      if (
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login'
      }
    }

    throw new ApiError(errorMessage, response.status)
  }

  // Handle empty 204 or empty response
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}
