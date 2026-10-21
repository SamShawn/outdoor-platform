export default defineAppConfig({
  pages: [
    'pages/activity-list/index', // ← 启动页
    'pages/profile/index',
    'pages/login/index',
    'pages/activity-create/index',
    'pages/activity-detail/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'SportLink',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#999999', // 未选中文字颜色
    selectedColor: '#2e7d32', // 选中文字颜色
    backgroundColor: '#ffffff', // 背景色
    borderStyle: 'black', // 边框颜色
    list: [
      {
        pagePath: 'pages/activity-list/index',
        text: '发现',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/user.png',
        selectedIconPath: 'assets/tabbar/user-active.png',
      },
    ],
  },
  requiredPrivateInfos: ['chooseLocation'],
  permission: {
    'scope.userLocation': {
      desc: '用于选择活动地点',
    },
  },
})
