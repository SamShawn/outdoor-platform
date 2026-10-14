import Taro from '@tarojs/taro'
import { request } from './request'
import { setToken } from '../utils/token'

export interface LoginResponse {
  accessToken: string
  user: {
    id: string
    nickname: string | null
    avatar: string | null
  }
}

export function wxLogin(): Promise<string> {
  return new Promise((resolve, reject) => {
    Taro.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(new Error('wx.login failed: no code'))
        }
      },
      fail: (err) => reject(err),
    })
  })
}

export async function login(): Promise<LoginResponse> {
  const code = await wxLogin()
  const data = await request<LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: { code },
    skipAuth: true, // 登录请求本身不需要 token
  })
  setToken(data.accessToken)
  return data
}
