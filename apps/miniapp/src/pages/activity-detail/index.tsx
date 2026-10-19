import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState } from 'react'

import { fetchActivityDetail, Activity } from '../../api/activity'
import { createOrder } from '../../api/order'
import { useUserStore } from '../../store/user'
import { formatDateTime, formatPrice } from '../../utils/format'

import './index.scss'

export default function ActivityDetail() {
  const router = useRouter()
  const id = router.params.id
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { isLoggedIn } = useUserStore()

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
    if (!isLoggedIn) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => Taro.navigateTo({ url: '/pages/login/index' }), 1000)
      return
    }

    if (!activity) return

    // 前端前置拦截
    if (activity.enrolled >= activity.quota) {
      Taro.showToast({ title: '名额已满', icon: 'none' })
      return
    }

    const now = new Date()
    const deadline = new Date(new Date(activity.startAt).getTime() - 2 * 60 * 60 * 1000)
    if (now >= deadline) {
      Taro.showToast({ title: '报名已截止', icon: 'none' })
      return
    }

    // 弹出确认框
    Taro.showModal({
      title: '确认报名',
      content: `活动: ${activity.title}\n费用: ${formatPrice(activity.price)}`,
      confirmText: '确认报名',
      confirmColor: '#2e7d32',
      success: async (res) => {
        if (res.confirm) {
          await submitOrder()
        }
      },
    })
  }

  const submitOrder = async () => {
    if (!activity) return
    setSubmitting(true)
    Taro.showLoading({ title: '报名中...', mask: true })

    try {
      await createOrder({ activityId: activity.id })
      Taro.hideLoading()
      Taro.showToast({ title: '报名成功', icon: 'success' })

      // 更新详情页的名额显示
      setActivity((prev) => (prev ? { ...prev, enrolled: prev.enrolled + 1 } : prev))

      // TODO: 1.3.6 阶段将在此处跳转到支付流程
    } catch (err) {
      Taro.hideLoading()
      const msg = err instanceof Error ? err.message : '报名失败'
      // 后端返回的 409 等错误信息可能被包在 message 里
      Taro.showToast({ title: msg, icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <View className="detail__loading">加载中...</View>
  }

  if (!activity) return null

  // 判断按钮状态
  const isFull = activity.enrolled >= activity.quota
  const isEnded = new Date() >= new Date(new Date(activity.startAt).getTime() - 2 * 60 * 60 * 1000)

  let btnText = '立即报名'
  let btnDisabled = false
  if (isFull) {
    btnText = '名额已满'
    btnDisabled = true
  } else if (isEnded) {
    btnText = '报名已截止'
    btnDisabled = true
  } else if (submitting) {
    btnText = '提交中...'
    btnDisabled = true
  }

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
            {formatDateTime(activity.startAt)} - {formatDateTime(activity.endAt)}
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
        <Button
          className={`detail__btn ${btnDisabled ? 'detail__btn--disabled' : ''}`}
          onClick={handleEnroll}
          disabled={btnDisabled}
        >
          {btnText}
        </Button>
      </View>
    </View>
  )
}
