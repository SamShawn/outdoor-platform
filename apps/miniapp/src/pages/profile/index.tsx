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
    // 👇 强制通知 TabBar 组件：现在应该是第 1 项高亮
    Taro.eventCenter.trigger('syncTabBar', 1)

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
      {/* 1. 顶部渐变背景与用户信息 */}
      <View className="profile__header-bg" />
      <View className="profile__header">
        <View className="profile__user-info">
          <Image
            className="profile__avatar"
            src={user?.avatar || 'https://via.placeholder.com/150x150?text=User'}
          />
          <View className="profile__text-info">
            <Text className="profile__name">{user?.nickname || '户外爱好者'}</Text>
            <Text className="profile__phone">{user?.phone || '未绑定手机号'}</Text>
          </View>
        </View>

        <Button className="profile__logout-btn" onClick={handleLogout}>
          退出登录
        </Button>
      </View>

      {/* 2. 悬浮数据统计卡片 */}
      <View className="profile__stats-card">
        <View className="profile__stat-item">
          <Text className="profile__stat-num">{createdItems.length}</Text>
          <Text className="profile__stat-label">发起活动</Text>
        </View>
        <View className="profile__stat-divider" />
        <View className="profile__stat-item">
          <Text className="profile__stat-num">{joinedItems.length}</Text>
          <Text className="profile__stat-label">参与活动</Text>
        </View>
      </View>

      {/* 3. 切换 Tab */}
      <View className="profile__tabs-wrapper">
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
      </View>

      {/* 4. 列表区域 */}
      <View className="profile__list">
        {activeTab === 'created' && (
          <View>
            {createdItems.map((item) => (
              <View key={item.id} className="profile__card" onClick={() => goToDetail(item.id)}>
                <Image
                  className="profile__card-cover"
                  src={item.cover || 'https://via.placeholder.com/150x150?text=No+Image'}
                  mode="aspectFill"
                />
                <View className="profile__card-info">
                  <Text className="profile__card-title">{item.title}</Text>
                  <Text className="profile__card-meta">🕐 {formatShortDateTime(item.startAt)}</Text>
                  <View className="profile__card-bottom">
                    <Text className="profile__card-price">{formatPrice(item.price)}</Text>
                    <Text className="profile__card-quota">
                      {item.enrolled}/{item.quota} 人已报名
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
                  src={item.activity?.cover || 'https://via.placeholder.com/150x150?text=No+Image'}
                  mode="aspectFill"
                />
                <View className="profile__card-info">
                  <Text className="profile__card-title">
                    {item.activity?.title || '活动已删除'}
                  </Text>
                  <Text className="profile__card-meta">
                    🕐{' '}
                    {item.activity?.startAt
                      ? formatShortDateTime(item.activity.startAt)
                      : '时间未知'}
                  </Text>
                  <View className="profile__card-bottom">
                    <Text className="profile__card-price">{formatPrice(item.amount)}</Text>
                    <Text className={`profile__card-status status-${item.status.toLowerCase()}`}>
                      {item.status === 'PAID'
                        ? '已支付'
                        : item.status === 'PENDING'
                          ? '待支付'
                          : '已取消'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 加载状态与空状态 */}
        {loading && <View className="profile__loading">加载中...</View>}
        {!loading && activeTab === 'created' && createdItems.length === 0 && (
          <View className="profile__empty">还没有发起过活动哦~</View>
        )}
        {!loading && activeTab === 'joined' && joinedItems.length === 0 && (
          <View className="profile__empty">还没有报名过活动哦~</View>
        )}
      </View>
    </View>
  )
}
