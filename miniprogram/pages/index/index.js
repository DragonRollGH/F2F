import "../../utils.js";
import { range } from "../../utils.js";
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';


var page;
const db = wx.cloud.database();
const CALENDAR = db.collection("CALENDAR");

const MAX_LIMIT = 20
const NOW = new Date();
var YEAR = NOW.getFullYear();
const year_got = [];

var data_ary = [];

function onLoad() {
  page = this;

  get_data_ary();
}

function get_data_ary() {
  // for collection CALENDAR
  if (-1 != year_got.indexOf(YEAR)) {
    return;
  }

  Toast.loading({
    message: 'loading...',
    forbidClick: true,
  });
  CALENDAR.where({yy: YEAR}).count().then(async res => {
    // console.log(res);
    let total = res.total;
    const batchTimes = Math.ceil(total / MAX_LIMIT);
    for (let i = 0; i < batchTimes; i++) {
      await CALENDAR.where({yy: YEAR}).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get().then(async res => {
        data_ary = data_ary.concat(res.data);
      });
    }
    // got collection CALENDAR
    // console.log(data_ary);
    year_got.push(YEAR);
    reload_day_formatter();
    Toast.clear();
  });
}

// data: {yy,mm,dd,d_id}
function add_doc(data) {
  return new Promise((resolve, reject) => {
    CALENDAR.add({
      data: data
    })
    .then(res => {
      data_ary.push({
        _id: res._id,
        yy: data.yy,
        mm: data.mm,
        dd: data.dd,
        d_id: data.d_id,
      });
      reload_day_formatter();
      resolve(res);
    })
    .catch(res => {
      reject(res);
    });
  });
}

// data: {yy,mm,dd}
function remove_doc(data) {
  return new Promise((resolve, reject) => {
    CALENDAR.where({
      yy: data.yy,
      mm: data.mm,
      dd: data.dd,
    }).remove()
    .then(res => {
      data_ary = data_ary.filter(i => !(i.yy == data.yy 
        && i.mm == data.mm
        && i.dd == data.dd));
      reload_day_formatter();
      resolve(res);
    })
    .catch(res => {
      reject(res);
    });
  });
}

function dayFormatter(day) {
  let y = day.date.getFullYear();
  let m = day.date.getMonth();
  let d = day.date.getDate();

  // 屏蔽选中高亮
  if ("selected" == day.type) {
    day.type = "";
  }

  // 有数据日期高亮
  if (data_ary.find(o => y == o.yy && m == o.mm && d == o.dd)) {
    day.type = "selected";
  }

  return day;
}

function reload_day_formatter() {
  page.setData({
    dayFormatter: null
  });
  page.setData({
    dayFormatter: dayFormatter
  });
}

function on_tap_day(e) {
  let y = e.detail.getFullYear();
  let m = e.detail.getMonth();
  let d = e.detail.getDate();

  let url = `../detail/index?yy=${y}&mm=${m}&dd=${d}`;

  let day_data = data_ary.find(o => y == o.yy && m == o.mm && d == o.dd);

  if (day_data) {
    url += `&c_id=${day_data._id}&d_id=${day_data.d_id}`;
  }
  wx.navigateTo({
    url: url,
  });
}

function on_click_year_btn(e) {
  page.setData({
    year_picker_pop: true,
  });
}

function on_cancel_year_picker(e) {
  page.setData({
    year_picker_pop: false,
  });
}

function on_confirm_year_picker(e) {
  YEAR = e.detail.value; 
  page.setData({
    mindate: new Date(YEAR, 0, 1).getTime(),
    maxdate: YEAR == NOW.getFullYear() ? NOW.getTime() : new Date(YEAR, 11, 31).getTime(),
    year_picker_pop: false,
  });
  get_data_ary();
}

Page({
  name: "calendar",
  data:{
    mindate: new Date(YEAR, 0, 1).getTime(),
    maxdate: NOW.getTime(),
    defaultdate: NOW.getTime(),
    year_picker_pop: false,
    year_picker_val: range(2017, YEAR + 1),
    year_picker_dft: YEAR - 2017,
  },
  data_ary: [],
  onLoad: onLoad,
  add_doc: add_doc,
  remove_doc: remove_doc,
  on_tap_day: on_tap_day,
  on_click_year_btn: on_click_year_btn,
  on_cancel_year_picker: on_cancel_year_picker,
  on_confirm_year_picker: on_confirm_year_picker,
})