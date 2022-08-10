App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'dev-2glgkbqf752830e7',
        // env: 'cloud1-2gzwy3rt6ca6732e',
        traceUser: true,
      })
    }

    this.globalData = {}
  }
})
