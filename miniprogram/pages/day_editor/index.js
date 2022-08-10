import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

var page;
var pages;
var detail_page;
var tp_option;

const TP_E = 3;
const TP_US = 4;

function onLoad(option) {
  page = this;
  pages = getCurrentPages();
  detail_page = pages.find(i => i.name == "detail");
  if (undefined == detail_page) {
    return;
  }

  set_tp_btn();
}

function set_tp_btn() {
  let on_tp_dis = false;
  let on_tp_btn;
  detail_page.get_tp_option()
  .then(res => {
    if (TP_US == res.option) {
      tp_option = TP_US;
      on_tp_btn = "设为多日起始日";
    } else if (TP_E == res.option) {
      tp_option = TP_E;
      on_tp_btn = "设为多日结束日";
    } else {
      on_tp_dis = true;
      on_tp_btn = "无法设为多日";
    }
    page.setData({
      on_tp_dis: on_tp_dis,
      on_tp_btn: on_tp_btn,
    });
    console.log(res);
  })
  .catch(res => {
    on_tp_dis = true;
    on_tp_btn = `无法设为多日 (err: ${res})`;
    page.setData({
      on_tp_dis: on_tp_dis,
      on_tp_btn: on_tp_btn,
    });
    console.log(res);
  });  
}

function on_tp(e) {
  if (undefined == tp_option) {
    Toast("err: undefined");
    return;
  }

  detail_page.set_tp({tp: tp_option})
  .then(res => {
    wx.navigateBack({
      delta: 2,
    });
  })
  .catch(res => {
    Toast(`err: ${res}`);
  });
}


function on_delete(e) {
  Dialog.confirm({
    title: '警告',
    message: '是否确认删除本日数据？',
  })
  .then(() => {
    // on confirm
    Toast.loading({
      message: '删除数据中...',
      forbidClick: true,
    });
    detail_page.remove_doc()
    .then(res => {
      Toast.clear();
      wx.navigateBack({
        delta: 2,
      });
    })
    .catch(res => {
      console.log(res);
      Toast.fail("删除失败！");
    });
  })
  .catch(() => {
    // on cancel
  });
}


Page({
  name: "day_editor",
  data: {
    on_tp_dis: true,
    on_tp_btn: "无法设为多日"
  },
  onLoad: onLoad,
  on_tp: on_tp,
  on_delete: on_delete,
})