import { View, Text, Image, Button } from '@tarojs/components'
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { useState } from 'react'

import { fetchActivityDetail, Activity } from '../../api/activity'
import { createOrder, checkEnrollment } from '../../api/order'
import { useUserStore } from '../../store/user'
import { formatDateTime, formatPrice } from '../../utils/format'

import './index.scss'

export default function ActivityDetail() {
  const router = useRouter()
  const id = router.params.id
  const [activity, setActivity] = useState<Activity | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
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
      // 1. 拉取活动详情
      const data = await fetchActivityDetail(activityId)
      setActivity(data)

      // 2. 如果已登录，精准查询是否报名
      if (isLoggedIn) {
        const checkRes = await checkEnrollment(activityId)
        // 直接提取布尔值
        setIsEnrolled(checkRes.enrolled)
      }
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
      await createOrder({ activityId: activity.id }) // 这里不需要用变量接收返回值了

      Taro.hideLoading()
      Taro.showToast({ title: '报名成功', icon: 'success' })

      // 1. 标记为已报名
      setIsEnrolled(true)

      // 2. 前端乐观更新，直接把名额 +1
      setActivity((prev) => (prev ? { ...prev, enrolled: prev.enrolled + 1 } : prev))
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

  // 计算按钮状态
  let btnText = '立即报名'
  let btnDisabled = false

  const isFull = activity.enrolled >= activity.quota
  const isEnded = new Date() >= new Date(new Date(activity.startAt).getTime() - 2 * 60 * 60 * 1000)

  if (isEnrolled) {
    btnText = '您已报名'
    btnDisabled = true
  } else if (isFull) {
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
      {/* 1. 顶部沉浸式大图 */}
      <View className="detail__hero">
        <Image
          className="detail__cover"
          src={activity.cover || 'https://via.placeholder.com/750x500?text=SportLink'}
          mode="aspectFill"
        />
        <View className="detail__mask" />
      </View>

      {/* 2. 核心信息卡片（使用负边距向上浮动，盖住一部分图片） */}
      <View className="detail__card">
        <View className="detail__header">
          <Text className="detail__price">{formatPrice(activity.price)}</Text>
          <View className="detail__quota-tag">
            <Text className="detail__quota-num">{activity.enrolled}</Text> / {activity.quota}{' '}
            人已报名
          </View>
        </View>
        <Text className="detail__title">{activity.title}</Text>
      </View>

      {/* 3. 时间与地点信息栏 */}
      <View className="detail__info-card">
        <View className="detail__info-item">
          <View className="detail__icon">🕐</View>
          <View className="detail__info-text">
            <Text className="detail__label">活动时间</Text>
            <Text className="detail__value">
              {formatDateTime(activity.startAt)} - {formatDateTime(activity.endAt)}
            </Text>
          </View>
        </View>

        <View className="detail__divider" />

        <View className="detail__info-item">
          <View className="detail__icon">📍</View>
          <View className="detail__info-text">
            <Text className="detail__label">集合地点</Text>
            <Text className="detail__value">{activity.location}</Text>
          </View>
        </View>
      </View>

      {/* 4. 发起人卡片 */}
      <View className="detail__organizer-card">
        <Image
          className="detail__avatar"
          src={activity.organizer.avatar || 'https://via.placeholder.com/100x100?text=User'}
        />
        <View className="detail__org-info">
          <Text className="detail__org-name">{activity.organizer.nickname || '户外爱好者'}</Text>
          <Text className="detail__org-role">活动发起人</Text>
        </View>
      </View>

      {/* 5. 活动详情描述 */}
      <View className="detail__desc-card">
        <Text className="detail__section-title">活动介绍</Text>
        <Text className="detail__desc-text">
          {activity.description || '发起人很懒，什么都没有写...'}
        </Text>
      </View>

      {/* 占位，防止内容被底部操作栏挡住 */}
      <View style={{ height: '160px' }} />

      {/* 6. 底部毛玻璃操作栏 */}
      <View className="detail__bottom-bar">
        <View className="detail__bottom-left">
          <Text className="detail__bottom-label">{isEnrolled ? '已成功报名' : '活动费用'}</Text>
          <Text className="detail__bottom-price">{formatPrice(activity.price)}</Text>
        </View>

        <Button
          className={`detail__btn ${isEnrolled ? 'detail__btn--enrolled' : btnDisabled ? 'detail__btn--disabled' : ''}`}
          onClick={handleEnroll}
          disabled={btnDisabled}
        >
          {btnText}
        </Button>
      </View>
    </View>
  )
}
