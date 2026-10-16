import { View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { ComponentType, useState } from 'react'

import { useUserStore } from '../store/user'

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function AuthGuard(props: P) {
    const [ready, setReady] = useState(false)
    const isLoggedIn = useUserStore((s) => s.isLoggedIn)

    useDidShow(() => {
      if (!isLoggedIn) {
        Taro.redirectTo({ url: '/pages/login/index' })
        return
      }
      setReady(true)
    })

    if (!ready) {
      return <View />
    }

    return <WrappedComponent {...props} />
  }
}
