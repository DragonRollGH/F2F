import MPServerless from '@alicloud/mpserverless-sdk';

const ali = new MPServerless(wx, {
  appId: 'wx716818372f87f589',
  spaceId: 'mp-3d7bd1da-5aa6-4149-9d47-6e38a31d8712',
  clientSecret: 'agjjy0RvMwjJFQIWRAXN5Q==',
  endpoint: 'https://api.next.bspapp.com',
});

App({
  ali: ali,
  onLaunch: function () {
    ali.init();

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env: 'dev-2glgkbqf752830e7',
        env: 'cloud1-2gzwy3rt6ca6732e',
        traceUser: true,
      })
    }

    this.globalData = {}
  }
})
