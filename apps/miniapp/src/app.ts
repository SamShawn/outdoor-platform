import { useLaunch } from '@tarojs/taro'
import { PropsWithChildren } from 'react'

import { request } from './api/request'
import { useUserStore } from './store/user'

import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(async () => {
    const { isLoggedIn, setUser, logout } = useUserStore.getState()

    if (!isLoggedIn) return

    try {
      const user = await request<{ id: string; nickname: string | null; avatar: string | null }>({
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
