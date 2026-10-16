import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useState } from 'react'

import { fetchActivities, Activity } from '../../api/activity'

import './index.scss'

const PAGE_SIZE = 10

export default function ActivityList() {
  const [items, setItems] = useState<Activity[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadData = async (targetPage: number, replace = false) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetchActivities({ page: targetPage, pageSize: PAGE_SIZE })
      const newItems = replace ? res.items : [...items, ...res.items]
      setItems(newItems)
      setPage(res.page)
      setHasMore(res.page < res.totalPages)
    } catch (err) {
      console.error('加载活动失败', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useDidShow(() => {
    loadData(1, true)
  })

  usePullDownRefresh(async () => {
    await loadData(1, true)
    Taro.stopPullDownRefresh()
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      loadData(page + 1)
    }
  })

  const handleDetail = (id: string) => {
    Taro.navigateTo({ url: `/pages/activity-detail/index?id=${id}` })
  }

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/activity-create/index' })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${month}月${day}日 ${hours}:${minutes}`
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return `¥${(price / 100).toFixed(2)}`
  }

  return (
    <View className="list">
      {items.length === 0 && !loading && (
        <View className="list__empty">
          <Text>暂无活动，去发布一个吧</Text>
        </View>
      )}

      {items.map((item) => (
        <View key={item.id} className="list__item" onClick={() => handleDetail(item.id)}>
          <Image
            className="list__cover"
            src={item.cover || 'https://via.placeholder.com/200x200?text=No+Image'}
            mode="aspectFill"
          />
          <View className="list__info">
            <Text className="list__title">{item.title}</Text>
            <Text className="list__meta">🕐 {formatDate(item.startAt)}</Text>
            <Text className="list__meta">📍 {item.location}</Text>
            <View className="list__bottom">
              <Text className="list__price">{formatPrice(item.price)}</Text>
              <Text className="list__quota">
                {item.enrolled}/{item.quota} 人
              </Text>
            </View>
          </View>
        </View>
      ))}

      {loading && (
        <View className="list__loading">
          <Text>加载中...</Text>
        </View>
      )}

      {!hasMore && items.length > 0 && (
        <View className="list__end">
          <Text>没有更多了</Text>
        </View>
      )}

      <View className="list__fab" onClick={handleCreate}>
        <Text>+</Text>
      </View>
    </View>
  )
}
