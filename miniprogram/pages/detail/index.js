import "../../utils.js";
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';


var page;
var pages;
var calendar_page;
var arg;
var edit_id;
const db = wx.cloud.database();
const DETAIL = db.collection("DETAIL");


function onLoad(option) {
  page = this;
  pages = getCurrentPages();
  calendar_page = pages.find(i => i.name == "calendar");
  arg = option;
  arg.yy = Number(arg.yy);
  arg.mm = Number(arg.mm);
  arg.dd = Number(arg.dd);
  // console.log(arg);

  set_date_title();

  set_events_panel();
}

function set_date_title() {
  let mm_val;
  let dd_val;

  switch(arg.mm) {
    case 0: mm_val = "Jan"; break;
    case 1: mm_val = "Feb"; break;
    case 2: mm_val = "Mar"; break;
    case 3: mm_val = "Apr"; break;
    case 4: mm_val = "May"; break;
    case 5: mm_val = "June"; break;
    case 6: mm_val = "July"; break;
    case 7: mm_val = "Aug"; break;
    case 8: mm_val = "Sep"; break;
    case 9: mm_val = "Oct"; break;
    case 10: mm_val = "Nov"; break;
    case 11: mm_val = "Dec"; break;
    // case 0: mm_val = "JANUARY"; break;
    // case 1: mm_val = "FEBRUARY"; break;
    // case 2: mm_val = "MARCH"; break;
    // case 3: mm_val = "APRIL"; break;
    // case 4: mm_val = "MAY"; break;
    // case 5: mm_val = "JUNE"; break;
    // case 6: mm_val = "JULY"; break;
    // case 7: mm_val = "AUGUST"; break;
    // case 8: mm_val = "SEPTEMBER"; break;
    // case 9: mm_val = "OCTOBER"; break;
    // case 10: mm_val = "NOVEMBER"; break;
    // case 11: mm_val = "DECEMBER"; break;
  }

  page.setData({
    mm_val: mm_val,
    dd_val: arg.dd,
    st_val: "--:--",
    et_val: "--:--",
  })
}

function set_events_panel() {
  if (undefined == arg.d_id) {
    return;
  }

  DETAIL.doc(arg.d_id).get().then(res => {
    let doc = res.data;
    let datas = {};
    if (undefined != doc.st) {
      datas.st_val = doc.st.Format("hh:mm");
    }
    if (undefined != doc.et) {
      datas.et_val = doc.et.Format("hh:mm");
    }
    if (undefined != doc.no) {
      datas.no_val = "No." + String(doc.no);
    }
    if (doc.ev) {
      // replace \n
      for (let i in doc.ev) {
        doc.ev[i].info = doc.ev[i].info.replace('\\n', '\n');
      }
      datas.ev_ary = doc.ev;
    }

    page.setData(datas);
  });
}

function init_doc() {
  return new Promise((resolve, reject) => {
    if (undefined != arg.d_id) {
        resolve();
        return;
    }

    Toast.loading({
      message: '创建记录中...',
      forbidClick: true,
    });

    let d_id;
    DETAIL.add({data: {}})
    .then(res => {
      d_id = res._id;
      calendar_page.add_doc({
        yy: arg.yy,
        mm: arg.mm,
        dd: arg.dd,
        d_id: d_id,
      })
      .then(res => {
        arg.d_id = d_id;
        arg.c_id = res._id;
        Toast.clear();
        resolve();
      });
    })
    .catch(res => {
      Toast.fail("创建失败！");
      reject();
    });
  });
}

function remove_doc() {
  return new Promise((resolve, reject) => {
    if (undefined == arg.d_id) {
        resolve();
        return;
    }

    DETAIL.doc(arg.d_id).remove()
    .then(res => {
      calendar_page.remove_doc({
        yy: arg.yy,
        mm: arg.mm,
        dd: arg.dd,
      })
      .then(res => {
        resolve(res);
      });
    })
    .catch(res => {
      reject(res);
    });
  });
}

// data: {idx}
function get_ev(data) {
  let ev_ary = page.data.ev_ary;
  if (undefined == arg.d_id
  || undefined == ev_ary
  || undefined == ev_ary[data.idx]) {
    return {msg: "undefined"};
  }

  return ev_ary[data.idx];
}

// data: {idx, site, type, info}
function update_ev(data) {
  return new Promise((resolve, reject) => {
    let ev_ary = page.data.ev_ary;
    if (undefined == arg.d_id
  || undefined == ev_ary
  || undefined == ev_ary[data.idx]) {
      reject({msg: "undefined"});
      return;
    }

    ev_ary[data.idx].site = data.site;
    ev_ary[data.idx].type = data.type;
    ev_ary[data.idx].info = data.info;
    page.setData({
      ev_ary: ev_ary
    });
    for (let i in ev_ary) {
      ev_ary[i].info = ev_ary[i].info.replace('\n', '\\n');
    }
    DETAIL.doc(arg.d_id).update({
      data: {
        ev: ev_ary
      }
    })
    .then(res => {
      resolve(res);
    })
    .catch(res => {
      reject(res);
    })
    for (let i in ev_ary) {
      ev_ary[i].info = ev_ary[i].info.replace('\\n', '\n');
    }
  });
}

// data: {idx}
function remove_ev(data) {
  return new Promise((resolve, reject) => {
    let ev_ary = page.data.ev_ary;
    if (undefined == arg.d_id
  || undefined == ev_ary
  || undefined == ev_ary[data.idx]) {
      reject({msg: "undefined"});
      return;
    }

    ev_ary.splice(data.idx, 1);
    page.setData({
      ev_ary: ev_ary
    });
    for (let i in ev_ary) {
      ev_ary[i].info = ev_ary[i].info.replace('\n', '\\n');
    }
    DETAIL.doc(arg.d_id).update({
      data: {
        ev: ev_ary
      }
    })
    .then(res => {
      resolve(res);
    })
    .catch(res => {
      reject(res);
    })
    for (let i in ev_ary) {
      ev_ary[i].info = ev_ary[i].info.replace('\\n', '\n');
    }
  });
}

function on_press_date_view(e) {
  wx.navigateTo({
    url: '../day_editor/index',
  });
}

function on_press_time_block(e) {
  init_doc();
  edit_id = e.currentTarget.id;
  page.setData({
    time_picker_pop: true,
    time_picker_val: new Date().Format("hh:mm"),
  });
}

function on_cancel_time_picker(e) {
  page.setData({
    time_picker_pop: false,
  });
  edit_id = null;
}

function on_confirm_time_picker(e) {
  if (undefined == arg.d_id)
  {
    return;
  }
  let d = new Date(
    arg.yy,
    arg.mm,
    arg.dd,
    e.detail.split(':')[0],
    e.detail.split(':')[1]
  );
  DETAIL.doc(arg.d_id).update({
    data: {
      [`${edit_id}`]: d
    }
  });
  page.setData({
    time_picker_pop: false,
    [`${edit_id}_val`]: e.detail,
  });
  edit_id = null;
}

function on_tap_add_btn(e) {
  if (undefined == arg.d_id) {
    Toast("请先设置时间");
    return;
  }

  let ev_ary = page.data.ev_ary;
  if (undefined == ev_ary) {
    ev_ary = [];
    page.data.ev_ary = ev_ary;
  }
  ev_ary.push({
    site: "",
    type: "",
    info: "",
  });
  page.setData({
    ev_ary: ev_ary
  });
  wx.navigateTo({
    url: `../ev_editor/index?d_id=${arg.d_id}&idx=${ev_ary.length-1}`,
  });
}

function on_press_ev_card(e) {
  wx.navigateTo({
    url: `../ev_editor/index?d_id=${arg.d_id}&idx=${e.currentTarget.id.split('.')[1]}`,
  });
}

Page({
  name: "detail",
  data:{
    time_picker_pop: false,
  },
  onLoad: onLoad,
  remove_doc: remove_doc,
  get_ev: get_ev,
  update_ev: update_ev,
  remove_ev: remove_ev,
  on_tap_add_btn: on_tap_add_btn,
  on_press_date_view: on_press_date_view,
  on_press_time_block: on_press_time_block,
  on_cancel_time_picker: on_cancel_time_picker,
  on_confirm_time_picker: on_confirm_time_picker,
  on_press_ev_card: on_press_ev_card,
})