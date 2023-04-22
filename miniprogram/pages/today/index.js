import "../../utils/utils.js";


var page;
var pages;
var calendar_page;
var arg;

const app = getApp();
// const db = wx.cloud.database();
const db = app.ali.db;
const DETAIL = db.collection(app.globalData.ali_db.detail);
var unpaired_start;

const TP_N = 0;
const TP_S = 1;
const TP_M = 2;
const TP_E = 3;
const NETWORK_TMO = 10000;

function onLoad(option) {
  page = this;
  pages = getCurrentPages();
  calendar_page = pages.find(i => i.name == "calendar");
  arg = option;
  arg.yy = Number(arg.yy);
  arg.mm = Number(arg.mm);
  arg.dd = Number(arg.dd);
  arg.tp = Number(arg.tp);
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

  wx.showLoading({
    title: '加载中',
    mask: true,
  });
  // DETAIL.doc(arg.d_id).get().then(res => {
  DETAIL.findOne({
    _id: arg.d_id
  }, {})
  .then(res => {
    // console.log(res)
    let doc = res.result;
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
    if (TP_S == arg.tp || TP_M == arg.tp) {
      datas.et_val = '午夜';
    }
    if (TP_E == arg.tp || TP_M == arg.tp) {
      datas.st_val = '凌晨';
    }
    if (doc.ev) {
      for (let i in doc.ev) {
        if (undefined == doc.ev[i] || undefined == doc.ev[i].info) {
          continue;
        }
        doc.ev[i].info = doc.ev[i].info.replace('\\n', '\n');
      }
      datas.ev_ary = doc.ev;
    }

    page.setData(datas);
    wx.hideLoading();
  })
  .catch(res => {
    console.log(res);
    wx.showToast({
      title: '加载失败',
      icon: 'error',
    });
    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      });
    }, 2000);
  });
}

function init_doc() {
  return new Promise((resolve, reject) => {
    if (undefined != arg.d_id) {
        resolve();
        return;
    }

    wx.showLoading({
      title: '创建记录中',
      mask: true,
    });

    let d_id;
    // DETAIL.add({data: {}})
    DETAIL.insertOne({
      _openid: app.globalData.uid,
    })
    .then(res => {
      d_id = res.result.insertedId;
      calendar_page.add_doc({
        yy: arg.yy,
        mm: arg.mm,
        dd: arg.dd,
        tp: TP_N,
        d_id: d_id,
        _openid: app.globalData.uid,
      })
      .then(res => {
        arg.d_id = d_id;
        arg.c_id = res.result.insertedId;
        arg.tp = TP_N;
        wx.hideLoading();
        resolve();
      });
    })
    .catch(res => {
      wx.showToast({
        title: '创建失败',
        icon: 'error',
      });
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

    // DETAIL.doc(arg.d_id).remove()
    DETAIL.deleteMany({
      _id: arg.d_id
    })
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

function update_ev_ary(ev_ary) {
  return new Promise((resolve, reject) => {
    if (undefined == arg.d_id
    || undefined == ev_ary) {
      reject("args undefined");
      return;
    }

    page.setData({
      ev_ary: ev_ary
    });
    // for (let i in ev_ary) {
    //   ev_ary[i].info = ev_ary[i].info.replace('\n', '\\n');
    // }
    // DETAIL.doc(arg.d_id).update({
    DETAIL.updateMany({
      _id: arg.d_id
    },{
      $set: {
        ev: ev_ary
      }
    })
    .then(res => {
      resolve(res);
    })
    .catch(res => {
      reject(res);
    })
    // for (let i in ev_ary) {
    //   ev_ary[i].info = ev_ary[i].info.replace('\\n', '\n');
    // }
  });
}

// data: {idx}
function get_ev(data) {
  let ev_ary = page.data.ev_ary;
  if (undefined == arg.d_id
  || undefined == ev_ary
  || undefined == ev_ary[data.idx]) {
    return {msg: "args undefined"};
  }

  return ev_ary[data.idx];
}

// data: {idx, site, type, info}
function update_ev(data) {
  let ev_ary = page.data.ev_ary;
  if (undefined == arg.d_id
  || undefined == ev_ary
  || undefined == ev_ary[data.idx]) {
    return Promise.reject({
      msg: "args undefined",
      d_id: arg.d_id,
      ev_ary: ev_ary,
      idx: data.idx,
    });
  }

  ev_ary[data.idx].site = data.site;
  ev_ary[data.idx].type = data.type;
  ev_ary[data.idx].info = data.info;
  return update_ev_ary(ev_ary);
}

// data: {idx}
function remove_ev(data) {
  let ev_ary = page.data.ev_ary;
  if (undefined == arg.d_id
  || undefined == ev_ary
  || undefined == ev_ary[data.idx]) {
    return Promise.reject({
      msg: "args undefined",
      d_id: arg.d_id,
      ev_ary: ev_ary,
      idx: data.idx,
    });
  }

  ev_ary.splice(data.idx, 1);
  return update_ev_ary(ev_ary);
}

function move_up_ev(idx) {
  let ev_ary = page.data.ev_ary;

  if (0 == idx) {
    return Promise.resolve();
  }
  ev_ary[idx] = ev_ary.splice(idx-1, 1, ev_ary[idx])[0];
  return update_ev_ary(ev_ary);
}

function move_down_ev(idx) {
  let ev_ary = page.data.ev_ary;

  if (page.data.ev_ary.length-1 == idx) {
    return Promise.resolve();
  }
  ev_ary[idx] = ev_ary.splice(idx+1, 1, ev_ary[idx])[0];
  return update_ev_ary(ev_ary);
}

function on_delete(e) {
  if (undefined == arg.c_id) {
    return;
  }

  if (undefined == arg.tp) {
    wx.showToast({
      title: '记录类型错误',
      icon: 'error',
    });
    return;
  } else if (TP_N == arg.tp) {
    wx.showModal({
      title: '警告',
      content: `确认删除本日数据？`,
    })
    .then(res => {
      if (res.confirm) {
        wx.showLoading({
          title: '删除数据中',
          mask: true,
        });
        page.remove_doc()
        .then(res => {
          wx.hideLoading();
          wx.navigateBack({
            delta: 1,
          });
        })
        .catch(res => {
          wx.showToast({
            title: '删除失败',
            icon: 'error',
          });
        });
      }
    });
  } else {
    calendar_page.get_range({c_id: arg.c_id})
    .then(res => {
      wx.showModal({
        title: '警告',
        content: `确认将本组${res.len}日记录全部转为单日记录？`,
      })
      .then(res => {
        if (res.confirm) {
          wx.showLoading({
            title: '转换数据中',
            mask: true,
          });
          calendar_page.remove_range({g_id: res.g_id})
          .then(res => {
            wx.hideLoading();
            wx.navigateBack({
              delta: 1,
            });
          })
          .catch(res => {
            console.log(res);
            wx.showToast({
              title: '转换失败',
              icon: 'error',
            });
          });
        }
      });
    })
    .catch(res => {
      console.log(res);
      wx.showToast({
        title: '记录类型错误',
        icon: 'error',
      });
    });
  }
}

function update_time(stet, time_val) {
  if (undefined == arg.d_id)
  {
    return;
  }
  let d = new Date(
    arg.yy,
    arg.mm,
    arg.dd,
    time_val.split(':')[0],
    time_val.split(':')[1]
  );

  wx.showLoading({
    title: '更新中',
  });
  // DETAIL.doc(arg.d_id).update({
  DETAIL.updateMany({
    _id: arg.d_id
  },{
    $set: {
      [`${stet}`]: d
    }
  })
  .then(res => {
    wx.hideLoading();
    page.setData({
      [`${stet}_val`]: time_val,
    });
  })
  .catch(res => {
    wx.showToast({
      title: '更新失败',
      icon: 'error',
    });
  });
}

function on_change_st(e) {
  console.log(`change st ${e.detail.value} ${page.data.time_picker_val}`)
  init_doc();
  page.setData({
    time_picker_val: new Date().Format("hh:mm"),
  });
  update_time("st", e.detail.value);
}

function on_change_et(e) {
  console.log(`change et ${e.detail.value} ${page.data.time_picker_val}`)
  init_doc();
  page.setData({
    time_picker_val: new Date().Format("hh:mm"),
  });
  update_time("et", e.detail.value);
}

function on_tap_add_ev(e) {
  // if (undefined == arg.d_id) {
  //   wx.showToast({
  //     title: '请先设置时间',
  //     icon: 'none',
  //   });
  //   return;
  // }
  init_doc()
  .then(res => {
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
  })
  .catch(res => {
    wx.showToast({
      title: '创建失败',
      icon: 'error',
    });
    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
      });
    }, 2000);
  });

}

function on_tap_address_text(e) {
  wx.navigateTo({
    url: `../ev_editor/index?d_id=${arg.d_id}&idx=${e.currentTarget.id.split('.')[1]}`,
  });
}

function on_tap_address_bar(e) {
  // if (e.position > half_height) {
  //   move_up_ev(e.currentTarget.id.split('.')[1])
  //   .catch(res => {
  //     wx.showToast({
  //       title: '移动失败',
  //       icon: 'error',
  //     });
  //   });
  // } else {
  //   move_down_ev(e.currentTarget.id.split('.')[1])
  //   .catch(res => {
  //     wx.showToast({
  //       title: '移动失败',
  //       icon: 'error',
  //     });
  //   });
  // }
}


Page({
  name: "detail",
  data:{
    front_color: app.globalData.front_color,
    time_picker_val: new Date().Format("hh:mm"),
  },
  onLoad: onLoad,
  remove_doc: remove_doc,
  get_ev: get_ev,
  update_ev: update_ev,
  remove_ev: remove_ev,
  on_change_st: on_change_st,
  on_change_et: on_change_et,
  on_tap_add_ev: on_tap_add_ev,
  on_delete: on_delete,
  on_tap_address_bar: on_tap_address_bar,
  on_tap_address_text: on_tap_address_text,
})