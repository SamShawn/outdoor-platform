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
    custom: true, // 👈 核心：开启官方自定义 TabBar
    color: '#999999',
    selectedColor: '#07c160',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/activity-list/index',
        text: '发现',
        iconPath: 'assets/tabbar/explore.png',
        selectedIconPath: 'assets/tabbar/explore-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/tabbar/profile.png',
        selectedIconPath: 'assets/tabbar/profile-active.png',
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
