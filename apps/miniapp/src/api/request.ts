import Taro from '@tarojs/taro'

import { BASE_URL } from '../utils/constants'
import { getToken, clearToken } from '../utils/token'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: unknown
  header?: Record<string, string>
  skipAuth?: boolean
}

interface ErrorResponse {
  statusCode?: number
  message?: string | string[]
  error?: string
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

  const errorData = res.data as ErrorResponse
  // NestJS 的 message 可能是字符串，也可能是字符串数组（ValidationPipe 校验失败时）
  const errorMessage = Array.isArray(errorData?.message)
    ? errorData.message[0]
    : errorData?.message || `HTTP ${res.statusCode}`
  throw new Error(errorMessage)
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
