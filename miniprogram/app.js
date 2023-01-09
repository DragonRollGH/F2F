import MPServerless from '@alicloud/mpserverless-sdk';

const ali = new MPServerless(wx, {
  appId: 'wx716818372f87f589',
  spaceId: 'mp-3d7bd1da-5aa6-4149-9d47-6e38a31d8712',
  clientSecret: 'agjjy0RvMwjJFQIWRAXN5Q==',
  endpoint: 'https://api.next.bspapp.com',
});

App({
  ali: ali,
  globalData: {},
  onLaunch: function () {
    ali.init()
    .then(res => {
      ali.user.getInfo()
      .then(res => {
        this.globalData.uid = res.result.user.oAuthUserId;
      })
      .catch(console.error);
    })
    .catch(console.error);

    // wx.cloud.init({
    //   env: 'cloud1-2gzwy3rt6ca6732e',
    //   traceUser: true,
    // })
  }
})
