import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useState, useRef, useCallback } from 'react'

import { fetchActivities, Activity, QueryActivityParams } from '../../api/activity'
import './index.scss'

const PAGE_SIZE = 10
const FILTERS = [
  { label: '全部', params: {} },
  { label: '免费', params: { isFree: true } },
  { label: '本周', params: { timeRange: 'week' as const } },
  { label: '本月', params: { timeRange: 'month' as const } },
]

export default function ActivityList() {
  const [items, setItems] = useState<Activity[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // 搜索与筛选状态
  const [keyword, setKeyword] = useState('')
  const [activeFilterIndex, setActiveFilterIndex] = useState(0)

  // 使用 ref 保存最新的查询参数，避免闭包问题
  const queryParamsRef = useRef<QueryActivityParams>({})

  // 核心加载逻辑
  const loadData = async (targetPage: number, replace = false) => {
    if (loading) return
    setLoading(true)
    try {
      // 合并分页参数和当前的筛选参数
      const params: QueryActivityParams = {
        ...queryParamsRef.current,
        page: targetPage,
        pageSize: PAGE_SIZE,
      }

      const res = await fetchActivities(params)
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

  // 触发重新搜索（重置页码，清空当前数据）
  const triggerSearch = useCallback((newKeyword: string, filterIndex: number) => {
    queryParamsRef.current = {
      keyword: newKeyword.trim() || undefined,
      ...FILTERS[filterIndex].params,
    }
    loadData(1, true)
  }, [])

  // 处理搜索框输入回车
  const handleSearchConfirm = () => {
    triggerSearch(keyword, activeFilterIndex)
  }

  // 处理点击筛选标签
  const handleFilterClick = (index: number) => {
    setActiveFilterIndex(index)
    triggerSearch(keyword, index)
  }

  // 首次挂载 / 每次返回页面
  useDidShow(() => {
    loadData(1, true)
  })

  // 下拉刷新
  usePullDownRefresh(async () => {
    await loadData(1, true)
    Taro.stopPullDownRefresh()
  })

  // 触底加载更多
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
      {/* 顶部搜索和筛选固定区 */}
      <View className="list__header">
        <View className="list__search-box">
          <Input
            className="list__search-input"
            placeholder="搜索活动标题"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearchConfirm}
            confirmType="search"
          />
        </View>

        <ScrollView className="list__filters" scrollX enableFlex>
          {FILTERS.map((f, index) => (
            <View
              key={f.label}
              className={`list__filter-tag ${index === activeFilterIndex ? 'active' : ''}`}
              onClick={() => handleFilterClick(index)}
            >
              {f.label}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 列表内容 */}
      <View className="list__content">
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

        {/* 悬浮按钮 */}
        <View className="list__fab" onClick={handleCreate}>
          <Text>+</Text>
        </View>
      </View>
    </View>
  )
}
