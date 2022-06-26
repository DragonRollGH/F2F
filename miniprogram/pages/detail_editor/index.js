var idx;
var page;
var pages;
var prev_page;

function onLoad(option) {
  page = this;
  pages = getCurrentPages();
  prev_page = pages[pages.length - 2];
  idx = option.idx;

  let ev_ary = prev_page.data.ev_ary;
  page.setData({
    site_val: ev_ary[idx].site,
    type_val: ev_ary[idx].type,
    info_val: ev_ary[idx].info,
  });
}

function on_submit(e) {
  if (undefined == idx) {
    return;
  }
  let ev_ary = prev_page.data.ev_ary;
  ev_ary[idx].site = page.data.site_val;
  ev_ary[idx].type = page.data.type_val;
  ev_ary[idx].info = page.data.info_val;
  prev_page.setData({
    ev_ary: ev_ary,
  });
  wx.navigateBack({
    delta: 0,
  });
} 

Page({
  data: {
    autosize: {minHeight: 50},
    site_picker_pop: false,
    site_picker_ary: [
      "E2206",
      "东湖",
      "淘金山"
    ]
  },
  onLoad: onLoad,
  on_submit: on_submit,
})