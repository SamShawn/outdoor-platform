import Taro from '@tarojs/taro'

import { getToken, clearToken } from '../utils/token'

const BASE_URL = process.env.TARO_APP_API_BASE || 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  header?: Record<string, string>
  skipAuth?: boolean
}

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

export async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data, header = {}, skipAuth = false } = options

  const finalHeader: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      finalHeader.Authorization = `Bearer ${token}`
    }
  }

  const res = await Taro.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: finalHeader,
  })

  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res.data as T
  }

  if (res.statusCode === 401 && !skipAuth) {
    await handleUnauthorized()
    return request<T>({ ...options, skipAuth: false })
  }

  throw new Error(`HTTP ${res.statusCode}`)
}

async function handleUnauthorized(): Promise<void> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      clearToken()
      const { login } = await import('./auth')
      await login()
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}
