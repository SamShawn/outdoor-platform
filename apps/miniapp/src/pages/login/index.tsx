import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'

import { useUserStore } from '../../store/user'
import './index.scss'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const login = useUserStore((s) => s.login)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await login()
      Taro.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        Taro.redirectTo({ url: '/pages/index/index' })
      }, 800)
    } catch (err) {
      console.error('登录失败', err)
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="login">
      <View className="login__header">
        <Text className="login__title">户外运动组局</Text>
        <Text className="login__subtitle">发现身边的活动，认识同好</Text>
      </View>

      <View className="login__actions">
        <Button className="login__btn" loading={loading} disabled={loading} onClick={handleLogin}>
          微信一键登录
        </Button>
        <Text className="login__tip">登录即表示同意《用户协议》和《隐私政策》</Text>
      </View>
    </View>
  )
}
