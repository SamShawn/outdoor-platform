import { View, Text, Input, Textarea, Button, Image, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'

import { createActivity } from '../../api/activity'
import { uploadImage } from '../../api/upload'
import { withAuth } from '../../components/withAuth'
import './index.scss'

function ActivityCreate() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cover, setCover] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [quota, setQuota] = useState('10')
  const [price, setPrice] = useState('0')
  const [submitting, setSubmitting] = useState(false)

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'] })
      const filePath = res.tempFilePaths[0]
      Taro.showLoading({ title: '上传中...' })
      const url = await uploadImage(filePath)
      setCover(url)
      Taro.hideLoading()
      Taro.showToast({ title: '上传成功', icon: 'success' })
    } catch (err) {
      Taro.hideLoading()
      console.error('上传失败', err)
      Taro.showToast({ title: '上传失败', icon: 'none' })
    }
  }

  const handleChooseLocation = async () => {
    try {
      const res = await Taro.chooseLocation({})
      setLocation(res.name || res.address)
      setLatitude(res.latitude)
      setLongitude(res.longitude)
    } catch (err) {
      console.error('选择地点失败', err)
      Taro.showToast({ title: '请手动输入地点', icon: 'none' })
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      return Taro.showToast({ title: '请填写标题', icon: 'none' })
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      return Taro.showToast({ title: '请选择时间', icon: 'none' })
    }

    // 1. 本地时间字符串
    const localStart = `${startDate}T${startTime}:00`
    const localEnd = `${endDate}T${endTime}:00`

    // 2. 转换为 Date 对象，此时 JS 引擎会将其视为本地时间
    const startDateObj = new Date(localStart)
    const endDateObj = new Date(localEnd)

    // 3. 使用 toISOString() 自动转换为 UTC 时间的标准格式
    const startAt = startDateObj.toISOString()
    const endAt = endDateObj.toISOString()

    // 4. 校验时间先后
    if (endAt <= startAt) {
      return Taro.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' })
    }

    if (!location.trim()) {
      return Taro.showToast({ title: '请填写地点', icon: 'none' })
    }

    if (Number(quota) <= 0) {
      return Taro.showToast({ title: '名额必须大于 0', icon: 'none' })
    }

    setSubmitting(true)

    try {
      await createActivity({
        title: title.trim(),
        description: description.trim() || undefined,
        cover: cover || undefined,
        startAt,
        endAt,
        location: location.trim(),
        latitude,
        longitude,
        quota: Number(quota),
        price: Math.round(Number(price) * 100),
      })
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000)
    } catch (err) {
      console.error('发布失败', err)
      Taro.showToast({ title: '发布失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="create">
      <View className="create__field">
        <Text className="create__label">标题</Text>
        <Input
          className="create__input"
          placeholder="给活动起个名字"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
          maxlength={100}
        />
      </View>

      <View className="create__field">
        <Text className="create__label">描述</Text>
        <Textarea
          className="create__textarea"
          placeholder="活动详情、注意事项"
          value={description}
          onInput={(e) => setDescription(e.detail.value)}
          maxlength={500}
        />
      </View>

      <View className="create__field">
        <Text className="create__label">封面</Text>
        {cover ? (
          <Image
            className="create__cover"
            src={cover}
            mode="aspectFill"
            onClick={handleChooseImage}
          />
        ) : (
          <View className="create__cover create__cover--empty" onClick={handleChooseImage}>
            <Text>+ 选择图片</Text>
          </View>
        )}
      </View>

      <View className="create__field">
        <Text className="create__label">开始时间</Text>
        <View className="create__row">
          <Picker mode="date" value={startDate} onChange={(e) => setStartDate(e.detail.value)}>
            <View className="create__picker">{startDate || '选择日期'}</View>
          </Picker>
          <Picker mode="time" value={startTime} onChange={(e) => setStartTime(e.detail.value)}>
            <View className="create__picker">{startTime || '选择时间'}</View>
          </Picker>
        </View>
      </View>

      <View className="create__field">
        <Text className="create__label">结束时间</Text>
        <View className="create__row">
          <Picker mode="date" value={endDate} onChange={(e) => setEndDate(e.detail.value)}>
            <View className="create__picker">{endDate || '选择日期'}</View>
          </Picker>
          <Picker mode="time" value={endTime} onChange={(e) => setEndTime(e.detail.value)}>
            <View className="create__picker">{endTime || '选择时间'}</View>
          </Picker>
        </View>
      </View>

      <View className="create__field">
        <Text className="create__label">地点</Text>
        <View className="create__row">
          <Input
            className="create__input create__input--flex"
            placeholder="输入地点或地图选点"
            value={location}
            onInput={(e) => setLocation(e.detail.value)}
          />
          <Button className="create__loc-btn" onClick={handleChooseLocation}>
            地图
          </Button>
        </View>
      </View>

      <View className="create__field">
        <Text className="create__label">名额</Text>
        <Input
          className="create__input"
          type="number"
          placeholder="活动人数上限"
          value={quota}
          onInput={(e) => setQuota(e.detail.value)}
        />
      </View>

      <View className="create__field">
        <Text className="create__label">价格（元）</Text>
        <Input
          className="create__input"
          type="digit"
          placeholder="0 表示免费"
          value={price}
          onInput={(e) => setPrice(e.detail.value)}
        />
      </View>

      <Button
        className="create__submit"
        loading={submitting}
        disabled={submitting}
        onClick={handleSubmit}
      >
        发布活动
      </Button>
    </View>
  )
}

export default withAuth(ActivityCreate)
