import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:3000/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, unknown>
}

export async function request<T>(options: RequestOptions): Promise<T> {
  const { url, method = 'GET', data } = options

  const res = await Taro.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
    },
  })

  if (res.statusCode >= 200 && res.statusCode < 300) {
    return res.data as T
  }

  throw new Error(`HTTP ${res.statusCode}`)
}
