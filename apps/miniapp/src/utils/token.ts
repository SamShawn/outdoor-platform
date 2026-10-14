import Taro from '@tarojs/taro'

const TOKEN_KEY = 'access_token'

export function getToken(): string | null {
  return Taro.getStorageSync(TOKEN_KEY) || null
}

export function setToken(token: string): void {
  Taro.setStorageSync(TOKEN_KEY, token)
}

export function clearToken(): void {
  Taro.removeStorageSync(TOKEN_KEY)
}
