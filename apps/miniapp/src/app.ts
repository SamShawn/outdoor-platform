import { useLaunch } from '@tarojs/taro'
import { PropsWithChildren } from 'react'

import { request } from './api/request'
import { useUserStore } from './store/user'
import { UserInfo } from './types'

import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(async () => {
    const { isLoggedIn, setUser, logout } = useUserStore.getState()

    if (!isLoggedIn) return

    try {
      const user = await request<UserInfo>({
        url: '/user/me',
      })
      setUser(user)
    } catch {
      // token 失效，清除登录态
      logout()
    }
  })

  return children
}

export default App
