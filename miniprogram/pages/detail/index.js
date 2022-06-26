import "../../utils.js";

const app = getApp();
var page;
var arg;
const db = wx.cloud.database();
const tb = db.collection('DETAIL');

var edit_id;

const DETAIL = {
  "_id": "17e3426e62235ecd1201a1015026e56f",
  "NO": 2.0,
  "ST": "06:54",
  "ET": "12:55",
  "EV": [
      {
          "LOC": {
              "I": "location",
              "S": "地点1"
          },
          "CON": {
              "I": "footprint",
              "S": "散步"
          },
          "DET": [
              {
                  "I": "drink",
                  "S": "喜茶1"
              },
              {
                  "I": "drink",
                  "S": "喜茶2"
              },
              {
                  "I": "drink",
                  "S": "喜茶3"
              },
          ]
      },
      {
          "LOC": {
              "I": "location",
              "S": "地点2"
          },
          "CON": {
              "I": "food",
              "S": "午饭"
          },
          "DET": [
              {
                  "I": "hambergur",
                  "S": "猪扒包"
              }
          ]
      }
  ]
}

function onLoad(option) {
  page = this;
  arg = option;
  console.log(arg);

  set_date_title();

  set_events_panel();
}

function set_date_title() {
  let mm_val;
  let dd_val;

  switch(arg.mm) {
    case "0": mm_val = "Jan"; break;
    case "1": mm_val = "Feb"; break;
    case "2": mm_val = "Mar"; break;
    case "3": mm_val = "Apr"; break;
    case "4": mm_val = "May"; break;
    case "5": mm_val = "June"; break;
    case "6": mm_val = "July"; break;
    case "7": mm_val = "Aug"; break;
    case "8": mm_val = "Sep"; break;
    case "9": mm_val = "Oct"; break;
    case "10": mm_val = "Nov"; break;
    case "11": mm_val = "Dec"; break;
    // case "0": mm_val = "JANUARY"; break;
    // case "1": mm_val = "FEBRUARY"; break;
    // case "2": mm_val = "MARCH"; break;
    // case "3": mm_val = "APRIL"; break;
    // case "4": mm_val = "MAY"; break;
    // case "5": mm_val = "JUNE"; break;
    // case "6": mm_val = "JULY"; break;
    // case "7": mm_val = "AUGUST"; break;
    // case "8": mm_val = "SEPTEMBER"; break;
    // case "9": mm_val = "OCTOBER"; break;
    // case "10": mm_val = "NOVEMBER"; break;
    // case "11": mm_val = "DECEMBER"; break;
  }

  page.setData({
    mm_val: mm_val,
    dd_val: arg.dd,
    st_val: "--:--",
    et_val: "--:--",
  })
}

function set_events_panel() {
  if (!arg.d_id) {
    return;
  }

  tb.doc(arg.d_id).get().then(res => {
    let doc = res.data;
    console.log(doc);
    // replace \n
    for (let i in doc.ev) {
      doc.ev[i].info = doc.ev[i].info.split('\\n').join('\n');
    }
    // set data
    page.setData({
      st_val: doc.st.Format("hh:mm"),
      et_val: doc.et.Format("hh:mm"),
      no_val: doc.no,
      ev_ary: doc.ev,
    })
  });
}

function on_tap_add_btn(e) {
  console.log(e);
  let ev_ary = page.data.ev_ary;
  if (!ev_ary) {
    ev_ary = [];
  }
  ev_ary.push({
    site: "地点",
    type: "类型",
    info: "详情",
  });
  page.setData({
    ev_ary: ev_ary,
  });
}


function pressToEdit(e) {
  // console.log(e);
  edit_id = e.currentTarget.id;
  if ("st" == edit_id || "et" == edit_id) {
    page.setData({
      time_picker_pop: true,
      time_picker_val: new Date().Format("hh:mm"),
    });
  } else if ("ev_ary" == edit_id.split('.')[0]) {
    wx.navigateTo({
      url: `../detail_editor/index?idx=${edit_id.split('.')[1]}`,
    })
  }


}

function onInputConfirm(e) {
  page.setData({
    time_picker_pop: false,
    [`${edit_id}_val`]: e.detail,
  });
  edit_id = ""
}

Page({
  data:{
    time_picker_pop: false,
  },
  onLoad: onLoad,
  on_tap_add_btn: on_tap_add_btn,
  pressToEdit: pressToEdit,
  onInputConfirm: onInputConfirm,
})