export default defineAppConfig({
  pages: [
    'pages/activity-list/index', // ← 启动页
    'pages/activity-detail/index',
    'pages/activity-create/index',
    'pages/profile/index',
    'pages/login/index',
    'pages/index/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Outdoor',
    navigationBarTextStyle: 'black',
  },
  requiredPrivateInfos: ['chooseLocation'],
  permission: {
    'scope.userLocation': {
      desc: '用于选择活动地点',
    },
  },
})
