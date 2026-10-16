export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/activity-create/index',
    'pages/activity-list/index',
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
