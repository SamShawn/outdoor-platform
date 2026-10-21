import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'

import './index.scss'

export default function CustomTabBar() {
  const [selected, setSelected] = useState(0)

  // 监听自定义事件，接收页面发来的同步指令
  useEffect(() => {
    const handleSync = (index: number) => {
      setSelected(index)
    }
    Taro.eventCenter.on('syncTabBar', handleSync)
    return () => {
      Taro.eventCenter.off('syncTabBar', handleSync)
    }
  }, [])

  const list = [
    { pagePath: '/pages/activity-list/index', text: '发现', icon: '🧭' },
    { pagePath: '/pages/profile/index', text: '我的', icon: '👤' },
  ]

  const switchTab = (index: number, url: string) => {
    if (selected === index) return
    setSelected(index)
    Taro.switchTab({ url })
  }

  const goToCreate = () => {
    Taro.navigateTo({ url: '/pages/activity-create/index' })
  }

  return (
    <View className="custom-tab-bar">
      <View className="custom-tab-bar__inner">
        <View
          className={`custom-tab-bar__item ${selected === 0 ? 'active' : ''}`}
          onClick={() => switchTab(0, list[0].pagePath)}
        >
          <Text className="custom-tab-bar__icon">{list[0].icon}</Text>
          <Text className="custom-tab-bar__text">{list[0].text}</Text>
        </View>

        <View className="custom-tab-bar__item custom-tab-bar__item--center" onClick={goToCreate}>
          <View className="custom-tab-bar__add-btn">
            <Text className="custom-tab-bar__add-icon">+</Text>
          </View>
        </View>

        <View
          className={`custom-tab-bar__item ${selected === 1 ? 'active' : ''}`}
          onClick={() => switchTab(1, list[1].pagePath)}
        >
          <Text className="custom-tab-bar__icon">{list[1].icon}</Text>
          <Text className="custom-tab-bar__text">{list[1].text}</Text>
        </View>
      </View>
    </View>
  )
}
