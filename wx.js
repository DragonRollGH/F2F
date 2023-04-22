wx.showLoading({
  title: '删除数据中',
  mask: true,
});

wx.hideLoading();

wx.showToast({
  title: '删除失败',
  icon: 'error',
});

wx.showModal({
  title: '警告',
  content: `确认删除本日数据？`,
})