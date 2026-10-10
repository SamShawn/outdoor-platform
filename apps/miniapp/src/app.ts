import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'

import './app.scss'

function App({ children }: PropsWithChildren<{ children?: React.ReactNode }>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return children
}

export default App
