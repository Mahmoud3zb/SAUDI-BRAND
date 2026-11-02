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

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { data, headers, ...customConfig } = options

  const isFormData = data instanceof FormData

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
      if (errorData?.message) errorMessage = errorData.message
    } catch {
      // ignore json parse error
    }
    throw new ApiError(errorMessage, response.status)
  }

  // Handle empty 204 or empty response
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}
