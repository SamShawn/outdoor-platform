import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState } from 'react'

import { fetchActivityDetail, Activity } from '../../api/activity'
import './index.scss'

export default function ActivityDetail() {
  const router = useRouter()
  const id = router.params.id
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)

  useDidShow(() => {
    if (!id) return
    loadDetail(id)
  })

  const loadDetail = async (activityId: string) => {
    setLoading(true)
    try {
      const data = await fetchActivityDetail(activityId)
      setActivity(data)
    } catch (err) {
      console.error('加载详情失败', err)
      Taro.showToast({ title: '活动不存在', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = () => {
    // 1.3 阶段实现报名功能
    Taro.showToast({ title: '报名功能开发中', icon: 'none' })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '免费'
    return `¥${(price / 100).toFixed(2)}`
  }

  if (loading) {
    return <View className="detail__loading">加载中...</View>
  }

  if (!activity) return null

  return (
    <View className="detail">
      {/* 封面图 */}
      <Image
        className="detail__cover"
        src={activity.cover || 'https://via.placeholder.com/750x400?text=No+Cover'}
        mode="aspectFill"
      />

      <View className="detail__main">
        {/* 基本信息 */}
        <Text className="detail__title">{activity.title}</Text>
        <View className="detail__price-row">
          <Text className="detail__price">{formatPrice(activity.price)}</Text>
          <Text className="detail__quota">
            {activity.enrolled}/{activity.quota} 人已报名
          </Text>
        </View>

        {/* 时间与地点 */}
        <View className="detail__info-item">
          <Text className="detail__info-label">时间</Text>
          <Text className="detail__info-value">
            {formatDate(activity.startAt)} - {formatDate(activity.endAt)}
          </Text>
        </View>
        <View className="detail__info-item">
          <Text className="detail__info-label">地点</Text>
          <Text className="detail__info-value">{activity.location}</Text>
        </View>

        {/* 发起人 */}
        <View className="detail__organizer">
          <Image
            className="detail__avatar"
            src={activity.organizer.avatar || 'https://via.placeholder.com/80x80?text=U'}
          />
          <Text className="detail__nickname">{activity.organizer.nickname || '户外爱好者'}</Text>
        </View>

        {/* 活动详情 */}
        <View className="detail__description">
          <Text className="detail__section-title">活动详情</Text>
          <Text className="detail__desc-text">{activity.description || '暂无详情'}</Text>
        </View>
      </View>

      {/* 底部操作栏 */}
      <View className="detail__bottom-bar">
        <View className="detail__bottom-price">
          <Text className="detail__bottom-label">费用</Text>
          <Text className="detail__bottom-value">{formatPrice(activity.price)}</Text>
        </View>
        <Button className="detail__btn" onClick={handleEnroll}>
          立即报名
        </Button>
      </View>
    </View>
  )
}
