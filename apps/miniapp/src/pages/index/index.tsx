import { View, Text } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { fetchHealth, HealthResponse } from '../../api/health'
import './index.scss'

export default function Index() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <View className="index">
      <Text className="title">后端连接状态</Text>

      {loading && <Text>Loading...</Text>}

      {health && (
        <View className="result">
          <Text>Status: {health.status}</Text>
          <Text>Server time: {new Date(health.timestamp).toLocaleString()}</Text>
          <Text>Uptime: {Math.floor(health.uptime)}s</Text>
        </View>
      )}

      {error && <Text className="error">Error: {error}</Text>}
    </View>
  )
}
