var idx;
var page;
var pages;
var detail_page;


function onLoad(option) {
  page = this;
  pages = getCurrentPages();
  detail_page = pages.find(i => i.name == "detail");
  idx = option.idx;

  let ev = detail_page.get_ev({idx: idx});
  if (undefined != ev) {
    page.setData({
      site_val: ev.site,
      type_val: ev.type,
      info_val: ev.info,
    });
  }
}

function on_submit(e) {
  if (undefined == idx) {
    return;
  }

  wx.showLoading({
    title: '更新记录中',
    mask: true,
  });
  detail_page.update_ev({
    idx: idx,
    site: e.detail.value.site_val,
    type: e.detail.value.type_val,
    info: e.detail.value.info_val,
  })
  .then(res => {
    wx.hideLoading();
    wx.navigateBack({
      delta: 0,
    });
  })
  .catch(res => {
    console.log(res);
    wx.hideLoading();
    wx.showToast({
      title: '更新失败',
      icon: 'error',
    });
  });
}

function on_delete(e) {
  wx.showModal({
    title: '警告',
    content: `确认删除本项条目？`,
  })
  .then(modalres => {
    if (modalres.confirm) {
      wx.showLoading({
        title: '删除记录中',
        mask: true,
      });
      detail_page.remove_ev({
        idx: idx
      })
      .then(res => {
        wx.hideLoading();
        wx.navigateBack({
          delta: 0,
        });
      })
      .catch(res => {
        console.log(res);
        wx.hideLoading();
        wx.showToast({
          title: '删除失败',
          icon: 'error',
        });
      });
    }
  });
}

Page({
  name: "ev_editor",
  data: {
    autosize: {minHeight: 50},
    site_val: "",
    type_val: "",
    info_val: "",
  },
  onLoad: onLoad,
  on_submit: on_submit,
  on_delete: on_delete,
})