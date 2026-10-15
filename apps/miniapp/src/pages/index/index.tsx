import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../store/user'
import './index.scss'

export default function Index() {
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    Taro.redirectTo({ url: '/pages/login/index' })
  }

  return (
    <View className="index">
      <Text className="title">户外运动组局</Text>
      {user ? (
        <View>
          <Text>欢迎，{user.nickname || '户外爱好者'}</Text>
          <Button onClick={handleLogout}>退出登录</Button>
        </View>
      ) : (
        <Text>加载中...</Text>
      )}
    </View>
  )
}
