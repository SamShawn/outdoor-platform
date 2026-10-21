import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro'
import { useState, useRef } from 'react'

import { fetchMyActivities, Activity } from '../../api/activity'
import { fetchMyOrders, OrderInfo } from '../../api/order'
import { useUserStore } from '../../store/user'
import { formatShortDateTime, formatPrice } from '../../utils/format'

import './index.scss'

const PAGE_SIZE = 10

export default function Profile() {
  const { user, isLoggedIn, logout } = useUserStore()
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')

  // 我发起的活动状态
  const [createdItems, setCreatedItems] = useState<Activity[]>([])
  const [createdPage, setCreatedPage] = useState(1)
  const [createdHasMore, setCreatedHasMore] = useState(true)

  // 我报名的活动状态
  const [joinedItems, setJoinedItems] = useState<OrderInfo[]>([])
  const [joinedPage, setJoinedPage] = useState(1)
  const [joinedHasMore, setJoinedHasMore] = useState(true)

  const [loading, setLoading] = useState(false)
  const isFirstShow = useRef(true)

  // 加载发起的活动
  const loadCreated = async (page: number) => {
    if (loading || !createdHasMore) return
    setLoading(true)
    try {
      const res = await fetchMyActivities({ page, pageSize: PAGE_SIZE })
      setCreatedItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]))
      setCreatedPage(res.page)
      setCreatedHasMore(res.page < res.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 加载报名的活动
  const loadJoined = async (page: number) => {
    if (loading || !joinedHasMore) return
    setLoading(true)
    try {
      const res = await fetchMyOrders({ page, pageSize: PAGE_SIZE })
      setJoinedItems((prev) => (page === 1 ? res.items : [...prev, ...res.items]))
      setJoinedPage(res.page)
      setJoinedHasMore(res.page < res.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 切换 Tab 或首次进入时加载
  useDidShow(() => {
    if (!isLoggedIn) {
      // 未登录，直接跳到登录页（但不能用 redirectTo，用 reLaunch 或 navigateTo）
      Taro.navigateTo({ url: '/pages/login/index' })
      return
    }

    // 已登录，加载数据
    if (isFirstShow.current || activeTab === 'created') {
      loadCreated(1)
      isFirstShow.current = false
    } else {
      loadJoined(1)
    }
  })

  const handleTabChange = (tab: 'created' | 'joined') => {
    if (activeTab === tab) return
    setActiveTab(tab)
    if (tab === 'created' && createdItems.length === 0) {
      loadCreated(1)
    } else if (tab === 'joined' && joinedItems.length === 0) {
      loadJoined(1)
    }
  }

  useReachBottom(() => {
    if (activeTab === 'created') {
      loadCreated(createdPage + 1)
    } else {
      loadJoined(joinedPage + 1)
    }
  })

  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          // 退出登录不需要 switchTab，直接回登录页
          Taro.reLaunch({ url: '/pages/login/index' })
        }
      },
    })
  }

  const goToDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${id}` })
  }

  // 渲染部分：如果未登录，可以返回一个空 View
  if (!isLoggedIn) return <View />

  return (
    <View className="profile">
      {/* 头部用户信息 */}
      <View className="profile__header">
        <Image
          className="profile__avatar"
          src={user?.avatar || 'https://via.placeholder.com/100x100?text=Avatar'}
        />
        <View className="profile__info">
          <Text className="profile__name">{user?.nickname || '户外爱好者'}</Text>
          <Text className="profile__phone">{user?.phone || '未绑定手机号'}</Text>
        </View>
        <Button className="profile__logout-btn" onClick={handleLogout}>
          退出
        </Button>
      </View>

      {/* Tab 切换 */}
      <View className="profile__tabs">
        <View
          className={`profile__tab ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => handleTabChange('created')}
        >
          我发起的
        </View>
        <View
          className={`profile__tab ${activeTab === 'joined' ? 'active' : ''}`}
          onClick={() => handleTabChange('joined')}
        >
          我报名的
        </View>
      </View>

      {/* 列表区域 */}
      <View className="profile__list">
        {activeTab === 'created' && (
          <View>
            {createdItems.map((item) => (
              <View key={item.id} className="profile__card" onClick={() => goToDetail(item.id)}>
                <Image
                  className="profile__card-cover"
                  src={item.cover || 'https://via.placeholder.com/100x100?text=No+Image'}
                  mode="aspectFill"
                />
                <View className="profile__card-info">
                  <Text className="profile__card-title">{item.title}</Text>
                  <Text className="profile__card-meta">{formatShortDateTime(item.startAt)}</Text>
                  <View className="profile__card-bottom">
                    <Text className="profile__card-price">{formatPrice(item.price)}</Text>
                    <Text className="profile__card-quota">
                      {item.enrolled}/{item.quota} 人
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'joined' && (
          <View>
            {joinedItems.map((item) => (
              <View
                key={item.id}
                className="profile__card"
                onClick={() => goToDetail(item.activityId)}
              >
                <Image
                  className="profile__card-cover"
                  src={item.activity?.cover || 'https://via.placeholder.com/100x100?text=No+Image'}
                  mode="aspectFill"
                />
                <View className="profile__card-info">
                  <Text className="profile__card-title">{item.activity?.title}</Text>
                  <Text className="profile__card-meta">
                    {formatShortDateTime(item.activity?.startAt || '')}
                  </Text>
                  <View className="profile__card-bottom">
                    <Text className="profile__card-price">{formatPrice(item.amount)}</Text>
                    <Text className="profile__card-status">{item.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 加载状态与空状态 */}
        {loading && <View className="profile__loading">加载中...</View>}
        {!loading && activeTab === 'created' && createdItems.length === 0 && (
          <View className="profile__empty">还没有发起过活动</View>
        )}
        {!loading && activeTab === 'joined' && joinedItems.length === 0 && (
          <View className="profile__empty">还没有报名过活动</View>
        )}
      </View>
    </View>
  )
}
